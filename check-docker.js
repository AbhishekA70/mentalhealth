const { execSync } = require('node:child_process')

function fail(message) {
  console.error(`\n[Docker prerequisite error]\n${message}\n`)
  process.exit(1)
}

try {
  execSync('docker version --format "{{.Server.Version}}"', {
    stdio: 'pipe',
    windowsHide: true,
  })
} catch (error) {
  const raw = [error?.stdout, error?.stderr]
    .filter(Boolean)
    .map((v) => String(v))
    .join('\n')

  if (/not recognized as the name of a cmdlet|is not recognized as an internal or external command/i.test(raw)) {
    fail(
      [
        'Docker CLI is not installed or not in PATH.',
        'Install Docker Desktop, then restart terminal/VS Code and run: npm run db:start',
      ].join('\n'),
    )
  }

  if (/pipe\\docker_engine|error during connect|The system cannot find the file specified/i.test(raw)) {
    fail(
      [
        'Docker Desktop is installed but engine is not reachable.',
        'Open Docker Desktop and wait until status is "Engine running".',
        'If needed, run terminal as Administrator and try again.',
      ].join('\n'),
    )
  }

  fail(
    [
      'Could not connect to Docker daemon.',
      'Open Docker Desktop (or install it) and ensure engine is running.',
      raw || 'No additional error output available.',
    ].join('\n'),
  )
}

console.log('Docker is available. Continuing...')
