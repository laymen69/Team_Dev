const os = require('os');
const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────────────
//  MANUAL OVERRIDE: pass IP as first argument
//  e.g.  node scripts/set-ip.js 10.171.1.172
// ─────────────────────────────────────────────────────
const manualIp = process.argv[2] || process.env.EXPO_IP;
if (manualIp) {
    console.log(`[Auto-IP] Manual override: using IP ${manualIp}`);
    writeIp(manualIp);
    process.exit(0);
}

function isPrivateIP(ip) {
    const parts = ip.split('.').map(Number);

    // Skip VirtualBox (192.168.56.x) and VMware (192.168.122.x) default ranges
    if (parts[0] === 192 && parts[1] === 168 && (parts[2] === 56 || parts[2] === 122)) {
        return false;
    }

    // Check for private IP ranges: 10.x.x.x, 172.16-31.x.x, 192.168.x.x
    return (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168)
    );
}

function getInterfacePriority(name) {
    const n = name.toLowerCase();

    // Skip virtual/docker interfaces
    if (
        n.includes('vethernet') ||
        n.includes('vmware') ||
        n.includes('virtualbox') ||
        n.includes('docker') ||
        n.includes('loopback')
    ) {
        return -1; // skip
    }

    // Ethernet (highest)
    if ((n.includes('ethernet') || n.includes('eth')) && !n.includes('vethernet')) return 4;

    // Wi-Fi (second)
    if (n.includes('wi-fi') || n.includes('wifi') || n.includes('wlan')) return 3;

    // Mobile Tethering / USB / Hotspot (third — this is the key addition)
    if (
        n.includes('tether') ||
        n.includes('mobile') ||
        n.includes('usb') ||
        n.includes('rndis') ||   // Android USB tethering on Windows
        n.includes('local area connection') ||
        n.includes('wireless mobile')
    ) return 2;

    // Any other valid private interface
    return 1;
}

function getLocalIp() {
    const interfaces = os.networkInterfaces();
    const candidates = [];

    console.log('[Auto-IP] Scanning network interfaces...');

    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family !== 'IPv4' || iface.internal) continue;

            const priority = getInterfacePriority(name);
            if (priority < 0) {
                console.log(`[Auto-IP] Skipping virtual interface: ${name} (${iface.address})`);
                continue;
            }

            if (!isPrivateIP(iface.address)) {
                console.log(`[Auto-IP] Skipping public IP: ${name} (${iface.address})`);
                continue;
            }

            candidates.push({ name, address: iface.address, priority });
            console.log(`[Auto-IP] Found: ${name} (${iface.address}) — Priority: ${priority}`);
        }
    }

    // Sort by priority (highest first)
    candidates.sort((a, b) => b.priority - a.priority);

    if (candidates.length > 0) {
        const selected = candidates[0];
        console.log(`[Auto-IP] Selected: ${selected.name} (${selected.address})`);
        return selected.address;
    }

    console.log('[Auto-IP] No suitable interface found, defaulting to 127.0.0.1');
    return '127.0.0.1';
}

function writeIp(ip) {
    const content = `export const SERVER_IP: string = '${ip}';\n`;
    const outputPath = path.join(__dirname, '..', 'constants', 'server-ip.ts');
    fs.writeFileSync(outputPath, content);
    console.log(`[Auto-IP] ✓ Wrote IP to ${outputPath}`);
    console.log(`[Auto-IP] ✓ Your app will connect to: http://${ip}:8000`);
}

const ip = getLocalIp();
writeIp(ip);
