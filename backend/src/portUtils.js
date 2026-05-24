import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const PORT_RELEASE_RETRY_COUNT = 10;
const PORT_RELEASE_RETRY_DELAY_MS = 250;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractPort(localAddress) {
  const match = /:(\d+)$/.exec(localAddress);
  return match ? Number(match[1]) : null;
}

function parseNetstatOutput(stdout, targetPort) {
  const lines = stdout.split(/\r?\n/);
  const pids = new Set();

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (!trimmedLine.startsWith("TCP")) {
      continue;
    }

    const parts = trimmedLine.split(/\s+/);

    if (parts.length < 5) {
      continue;
    }

    const localAddress = parts[1];
    const state = parts[3];
    const pid = Number(parts[4]);
    const port = extractPort(localAddress);

    if (port === targetPort && state === "LISTENING" && Number.isInteger(pid)) {
      pids.add(pid);
    }
  }

  return [...pids];
}

async function findWindowsPidsUsingPort(port) {
  // We use netstat because it is available by default on Windows and prints
  // the PID associated with each listening TCP port.
  const { stdout } = await execFileAsync("netstat", ["-ano", "-p", "TCP"]);
  return parseNetstatOutput(stdout, port);
}

function isProcessRunning(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function killWindowsProcess(pid) {
  // We try Node's native process.kill first because it is the simplest option
  // and avoids depending on a shell command when we already know the PID.
  try {
    process.kill(pid);
  } catch (error) {
    if (error?.code !== "ESRCH") {
      const details = error?.message || "Unknown error.";
      throw new Error(`Node process.kill failed. ${details}`);
    }
  }

  if (!isProcessRunning(pid)) {
    return;
  }

  // If the process is still alive, we fall back to taskkill.
  // taskkill is the standard Windows command for terminating a process by PID.
  // /F ensures a stale development process does not keep the port locked.
  await execFileAsync("taskkill", ["/PID", String(pid), "/F"]);
}

async function waitForPortRelease(port, pid) {
  for (let attempt = 0; attempt < PORT_RELEASE_RETRY_COUNT; attempt += 1) {
    await sleep(PORT_RELEASE_RETRY_DELAY_MS);

    const pids = await findWindowsPidsUsingPort(port);

    if (!pids.includes(pid)) {
      return;
    }
  }

  throw new Error(`PID ${pid} was terminated, but port ${port} is still occupied.`);
}

export async function ensurePortAvailable(port) {
  console.log(`[Server] Checking port ${port}...`);

  if (process.platform !== "win32") {
    console.log("[Server] Automatic port cleanup is enabled for Windows only.");
    return;
  }

  const pids = await findWindowsPidsUsingPort(port);
  const otherPids = pids.filter((pid) => pid !== process.pid);

  if (otherPids.length === 0) {
    console.log(`[Server] Port ${port} is available.`);
    return;
  }

  console.log(`[Server] Port ${port} is occupied.`);
  console.log(`[Server] Found PID${otherPids.length > 1 ? "s" : ""}: ${otherPids.join(", ")}`);

  for (const pid of otherPids) {
    console.log(`[Server] Terminating process ${pid}...`);

    try {
      await killWindowsProcess(pid);
      await waitForPortRelease(port, pid);
      console.log(`[Server] Process ${pid} terminated successfully.`);
    } catch (error) {
      const details = error?.stderr?.trim() || error?.message || "Unknown error.";
      throw new Error(`Failed to terminate PID ${pid}. ${details}`);
    }
  }
}
