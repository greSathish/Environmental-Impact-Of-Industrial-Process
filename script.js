document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const path = window.location.pathname.split("/").pop() || 'index.html';

    // Animation body
    document.body.style.opacity = 0;
    fadeIn(document.body);

    const protectedPages = ['home.html', 'submit.html', 'view.html', 'history.html'];
    if (protectedPages.includes(path) && !localStorage.getItem('currentCompany')) {
        window.location.href = 'index.html';
        return;
    }
    
    switch (path) {
        case 'index.html': initIndexPage(); break;
        case 'home.html': initHomePage(); break;
        case 'submit.html':
        case 'view.html':
        case 'history.html':
            initAppPage(path);
            break;
    }
});

// --- Animation helpers ---
function fadeIn(element, duration = 500) {
    element.style.transition = `opacity ${duration}ms ease`;
    setTimeout(() => element.style.opacity = 1, 10); 
}

function staggerFadeIn(elements, delay = 100) {
    elements.forEach((el, index) => {
        el.style.opacity = 0;
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${index * delay}ms, transform 0.5s ease ${index * delay}ms`;
        setTimeout(() => {
            el.style.opacity = 1;
            el.style.transform = 'translateY(0)';
        }, 20);
    });
}

function animateButtonClick(button) {
    button.style.transform = 'scale(0.95)';
    setTimeout(() => button.style.transform = 'scale(1)', 150);
}


// --- Software Logic ---
const thresholds = {
    air: { moderate: 50, high: 100 }, water: { moderate: 40, high: 80 },
    sound: { moderate: 65, high: 85 }, land: { moderate: 20, high: 50 }
};

function handleLogout() {
    localStorage.removeItem('currentCompany');
    localStorage.removeItem('latestData');
    window.location.href = 'index.html';
}

function initIndexPage() {
    const loginCard = document.getElementById('login-card');
    const registerCard = document.getElementById('register-card');
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); loginCard.style.display = 'none'; registerCard.style.display = 'block'; });
    showLoginLink.addEventListener('click', (e) => { e.preventDefault(); registerCard.style.display = 'none'; loginCard.style.display = 'block'; });

    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('register-password');
    const registerBtn = registerForm.querySelector('button');

    passwordInput.addEventListener('input', () => validatePassword(passwordInput, registerBtn));
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        animateButtonClick(registerBtn);
        const newCompany = {
            name: document.getElementById('register-company-name').value,
            email: document.getElementById('register-company-email').value,
            location: document.getElementById('register-company-location').value,
            password: passwordInput.value
        };
        let companies = JSON.parse(localStorage.getItem('companies')) || [];
        if (companies.find(c => c.name.toLowerCase() === newCompany.name.toLowerCase())) {
            alert('A company with this name already exists.');
            return;
        }
        companies.push(newCompany);
        localStorage.setItem('companies', JSON.stringify(companies));
        localStorage.setItem('currentCompany', JSON.stringify(newCompany));
        setTimeout(() => window.location.href = 'home.html', 200);
    });

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        animateButtonClick(loginForm.querySelector('button'));
        const companyName = document.getElementById('login-company-name').value;
        const password = document.getElementById('login-password').value;
        const companies = JSON.parse(localStorage.getItem('companies')) || [];
        const company = companies.find(c => c.name.toLowerCase() === companyName.toLowerCase());

        if (company && company.password === password) {
            localStorage.setItem('currentCompany', JSON.stringify(company));
            setTimeout(() => window.location.href = 'home.html', 200);
        } else {
            alert('Invalid company name or password.');
        }
    });
}

function validatePassword(passwordInput, submitBtn) {
    const pass = passwordInput.value;
    const checks = {
        length: pass.length >= 4,
        capital: /[A-Z]/.test(pass),
        number: /[0-9]/.test(pass),
        symbol: /[!@#$%^&*_-]/.test(pass)
    };
    let allValid = true;
    for (const key in checks) {
        const element = document.getElementById(key);
        if (element) {
            element.className = checks[key] ? 'valid' : 'invalid';
            if (!checks[key]) allValid = false;
        }
    }
    if (submitBtn) submitBtn.disabled = !allValid;
}

function initHomePage() {
    const company = JSON.parse(localStorage.getItem('currentCompany'));
    if (company) document.getElementById('welcome-message').textContent = `Welcome, ${company.name}!`;
    document.querySelector('.logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        handleLogout();
    });
    staggerFadeIn(document.querySelectorAll('.info-card, .content-card'));
}

function initAppPage(pageName) {
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) {
        const sidebarHandle = document.createElement('div');
        sidebarHandle.className = 'sidebar-handle';
        appLayout.prepend(sidebarHandle);

        appLayout.addEventListener('mouseenter', () => appLayout.classList.add('sidebar-visible'));
        appLayout.addEventListener('mouseleave', () => appLayout.classList.remove('sidebar-visible'));
    }
    
    staggerFadeIn(document.querySelectorAll('.content-card, .chart-card, .shortcut-link, .page-header'));

    if (pageName === 'submit.html') initSubmitPage();
    if (pageName === 'view.html') initViewPage();
    if (pageName === 'history.html') initHistoryPage();
}

function initSubmitPage() {
    const submitForm = document.getElementById('data-submission-form');
    if (submitForm) {
        submitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            animateButtonClick(submitForm.querySelector('button'));
            const company = JSON.parse(localStorage.getItem('currentCompany'));
            const newData = {
                companyName: company.name,
                air: document.getElementById('air-input').value,
                water: document.getElementById('water-input').value,
                sound: document.getElementById('sound-input').value,
                land: document.getElementById('land-input').value,
                date: new Date().toISOString()
            };
            const history = JSON.parse(localStorage.getItem('pollutionHistory')) || [];
            history.push(newData);
            localStorage.setItem('pollutionHistory', JSON.stringify(history));
            localStorage.setItem('latestData', JSON.stringify(newData));
            setTimeout(() => window.location.href = 'view.html', 200);
        });
    }
    document.querySelector('.logout-btn').addEventListener('click', handleLogout);
}

function initViewPage() {
    const latestData = JSON.parse(localStorage.getItem('latestData'));
    const container = document.getElementById('view-data-container');

    if (!latestData || !container) {
        if(container) container.innerHTML = `<div class="content-card"><p>No data to display. Please go to the 'Submit Data' page to enter new information.</p></div>`;
        return;
    }
    
    document.getElementById('report-actions').style.display = 'flex';
    container.innerHTML = `
        <div class="chart-card" data-report-item="true"><h3>Air Pollution Entry </h3><div class="chart-container"><canvas id="air-chart"></canvas></div><div id="air-status" class="status-message"></div><div id="air-comparison" class="comparison-text"></div></div>
        <div class="chart-card" data-report-item="true"><h3>Water Pollution Entry </h3><div class="chart-container"><canvas id="water-chart"></canvas></div><div id="water-status" class="status-message"></div><div id="water-comparison" class="comparison-text"></div></div>
        <div class="chart-card" data-report-item="true"><h3>Sound Pollution Entry </h3><div class="chart-container"><canvas id="sound-chart"></canvas></div><div id="sound-status" class="status-message"></div><div id="sound-comparison" class="comparison-text"></div></div>
        <div class="chart-card" data-report-item="true"><h3>Land Pollution Entry </h3><div class="chart-container"><canvas id="land-chart"></canvas></div><div id="land-status" class="status-message"></div><div id="land-comparison" class="comparison-text"></div></div>
    `;

    const pollutionTypes = ['air', 'water', 'sound', 'land'];
    pollutionTypes.forEach(type => renderIndividualChart(type, latestData));
    
    document.getElementById('download-analysis-pdf-btn').addEventListener('click', generateAnalysisPDF);
    document.getElementById('email-analysis-pdf-btn').addEventListener('click', handleEmailReport);
    document.querySelector('.logout-btn').addEventListener('click', handleLogout);
}

function renderIndividualChart(type, latestData) {
    const value = parseInt(latestData[type]) || 0;
    const { color, message, statusClass } = getPollutionStatus(type, value);
    
    document.getElementById(`${type}-status`).textContent = message;
    document.getElementById(`${type}-status`).className = `status-message ${statusClass}`;

    const ctx = document.getElementById(`${type}-chart`).getContext('2d');
    const allHistory = JSON.parse(localStorage.getItem('pollutionHistory')) || [];
    const companyHistory = allHistory.filter(d => d.companyName === latestData.companyName);
    const pastData = companyHistory.map(d => parseInt(d[type]) || 0);
    const labels = companyHistory.map((d, i) => `Entry ${i + 1}`);

    const comparisonText = document.getElementById(`${type}-comparison`);
    if (companyHistory.length > 1) {
        const previousValue = parseInt(companyHistory[companyHistory.length - 2][type]) || 0;
        const change = value - previousValue;
        const percentageChange = previousValue === 0 ? 100 : Math.round((change / previousValue) * 100);

        if (change > 0) {
            comparisonText.innerHTML = `<i data-lucide="trending-up" class="increase"></i> Increased by ${percentageChange}% from last entry (${previousValue}).`;
        } else if (change < 0) {
            comparisonText.innerHTML = `<i data-lucide="trending-down" class="decrease"></i> Decreased by ${Math.abs(percentageChange)}% from last entry (${previousValue}).`;
        } else {
            comparisonText.textContent = `No change from last entry (${previousValue}).`;
        }
        lucide.createIcons();
    } else {
        comparisonText.textContent = 'This is the first data entry.';
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: `${type.charAt(0).toUpperCase() + type.slice(1)} Pollution`,
                data: pastData, borderColor: color, borderWidth: 3, tension: 0.4, fill: false,
                pointRadius: 5, pointBackgroundColor: color, pointBorderColor: '#fff', pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            animation: { duration: 1000, easing: 'easeOutQuart' },
            scales: { y: { beginAtZero: true, grid: { color: 'var(--border-dark)' }, ticks: { color: 'var(--text-secondary)' } }, x: { grid: { display: false }, ticks: { color: 'var(--text-secondary)' } } },
            plugins: { legend: { display: false } }
        }
    });
}

function getPollutionStatus(type, value) {
    const threshold = thresholds[type];
    if (value < threshold.moderate) {
        return { text: 'Low', color: 'var(--status-blue)', message: "Pollution Level LOW... Pollution is Under Control ", statusClass: 'status-blue' };
    } else if (value < threshold.high) {
        return { text: 'Moderate', color: 'var(--status-orange)', message: "Pollution Level MODERATE... Please take measures to reduce.", statusClass: 'status-orange' };
    } else {
        return { text: 'High', color: 'var(--status-red)', message: "Pollution Level HIGH. Warning!!! Reduce your Pollution level Immediately.", statusClass: 'status-red' };
    }
}

async function handleEmailReport() {
    alert('A PDF of the report will be downloaded. A new Gmail tab will then open for you to attach it.');
    await generateAnalysisPDF(); // Wait for the PDF to be generated and downloaded first
    const company = JSON.parse(localStorage.getItem('currentCompany'));
    const subject = `Pollution Analysis Report for ${company.name}`;
    const body = `Dear Team,\n\n the latest pollution analysis report as been attached.\n\n This report was generated on ${new Date().toLocaleString()}.\n\nBest Regards,\nEnviroTrack System`;

    // Gmail URL 
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(company.email)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Open Gmail
    window.open(gmailUrl, '_blank');
}

async function generateAnalysisPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const company = JSON.parse(localStorage.getItem('currentCompany'));
    const reportDate = new Date().toLocaleDateString();

    pdf.setFontSize(22); pdf.text(`Pollution Analysis Report`, 105, 20, { align: 'center' });
    pdf.setFontSize(14); pdf.text(`Company: ${company.name}`, 105, 30, { align: 'center' });
    pdf.text(`Date: ${reportDate}`, 105, 38, { align: 'center' });

    const reportItems = document.querySelectorAll('[data-report-item="true"]');
    let yPos = 50;
    for (let i = 0; i < reportItems.length; i++) {
        const canvas = await html2canvas(reportItems[i], { backgroundColor: '#1f2937' });
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        if (yPos + pdfHeight > 280 && i > 0) { pdf.addPage(); yPos = 20; }
        pdf.addImage(imgData, 'PNG', 10, yPos, pdfWidth - 20, pdfHeight - 10);
        yPos += pdfHeight;
    }
    pdf.save(`Analysis-Report-${company.name.replace(/\s/g, '_')}-${reportDate}.pdf`);
}

function initHistoryPage() {
    const historyTableBody = document.getElementById('history-table-body');
    const company = JSON.parse(localStorage.getItem('currentCompany'));
    
    if (document.getElementById('history-company-name')) {
        document.getElementById('history-company-name').textContent = `Industry Name: ${company.name}`;
    }

    const allHistory = JSON.parse(localStorage.getItem('pollutionHistory')) || [];
    const companyHistory = allHistory.filter(entry => entry.companyName === company.name);

    if (historyTableBody) {
        if (companyHistory.length === 0) {
            historyTableBody.innerHTML = '<tr><td colspan="5">You have no submission history yet.</td></tr>';
        } else {
            companyHistory.slice().reverse().forEach(data => {
                const airStatus = getPollutionStatus('air', data.air);
                const waterStatus = getPollutionStatus('water', data.water);
                const soundStatus = getPollutionStatus('sound', data.sound);
                const landStatus = getPollutionStatus('land', data.land);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(data.date).toLocaleString()}</td>
                    <td><div class="history-level">${data.air}</div><span class="history-status ${airStatus.statusClass}">${airStatus.text}</span></td>
                    <td><div class="history-level">${data.water}</div><span class="history-status ${waterStatus.statusClass}">${waterStatus.text}</span></td>
                    <td><div class="history-level">${data.sound}</div><span class="history-status ${soundStatus.statusClass}">${soundStatus.text}</span></td>
                    <td><div class="history-level">${data.land}</div><span class="history-status ${landStatus.statusClass}">${landStatus.text}</span></td>
                `;
                historyTableBody.appendChild(row);
            });
        }
    }
    document.getElementById('download-history-pdf-btn').addEventListener('click', () => generateHistoryPDF(companyHistory, company));
    document.querySelector('.logout-btn').addEventListener('click', handleLogout);
}

function generateHistoryPDF(history, company) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    const reportDate = new Date().toLocaleDateString();

    pdf.setFontSize(18); pdf.text(`Submission History Report`, 14, 22);
    pdf.setFontSize(12); pdf.text(`Company: ${company.name}`, 14, 30);
    pdf.text(`Date Generated: ${reportDate}`, 14, 36);

    pdf.autoTable({
        startY: 42,
        head: [['Date & Time', 'Air', 'Water', 'Sound', 'Land']],
        body: history.map(entry => {
            const airStatus = getPollutionStatus('air', entry.air).text;
            const waterStatus = getPollutionStatus('water', entry.water).text;
            const soundStatus = getPollutionStatus('sound', entry.sound).text;
            const landStatus = getPollutionStatus('land', entry.land).text;
            return [
                new Date(entry.date).toLocaleString(),
                `${entry.air} (${airStatus})`,
                `${entry.water} (${waterStatus})`,
                `${entry.sound} (${soundStatus})`,
                `${entry.land} (${landStatus})`
            ];
        }),
        theme: 'striped',
        headStyles: { fillColor: [0, 169, 255] }
    });
    pdf.save(`History-Report-${company.name.replace(/\s/g, '_')}-${reportDate}.pdf`);
}
