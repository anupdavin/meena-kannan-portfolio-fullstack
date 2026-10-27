while ($true) {
    Write-Host "[Tunnel] Connecting to localhost.run..."
    ssh.exe -o StrictHostKeyChecking=no -o ServerAliveInterval=15 -o ServerAliveCountMax=3 -R 80:127.0.0.1:4173 nokey@localhost.run
    Write-Host "[Tunnel] Disconnected, reconnecting in 2s..."
    Start-Sleep -Seconds 2
}
