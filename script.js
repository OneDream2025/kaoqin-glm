let checkinData = {
    todayCheckin: null,
    todayCheckout: null,
    history: []
};

let leaveApplications = [
    {
        id: 1,
        type: 'annual',
        typeName: '年假',
        startDate: '2024-01-15',
        endDate: '2024-01-17',
        days: 3,
        reason: '家庭事务需要处理',
        status: 'approved',
        applicant: '李四',
        department: '技术部',
        applyTime: '2024-01-10 09:30'
    },
    {
        id: 2,
        type: 'sick',
        typeName: '病假',
        startDate: '2024-01-20',
        endDate: '2024-01-20',
        days: 1,
        reason: '身体不适需要休息',
        status: 'pending',
        applicant: '王五',
        department: '市场部',
        applyTime: '2024-01-19 22:15'
    },
    {
        id: 3,
        type: 'personal',
        typeName: '事假',
        startDate: '2024-01-25',
        endDate: '2024-01-26',
        days: 2,
        reason: '办理个人证件',
        status: 'pending',
        applicant: '赵六',
        department: '人事部',
        applyTime: '2024-01-18 14:20'
    }
];

let myApplications = [
    {
        id: 101,
        type: 'annual',
        typeName: '年假',
        startDate: '2024-01-08',
        endDate: '2024-01-08',
        days: 1,
        reason: '个人事务',
        status: 'approved',
        applyTime: '2024-01-05 10:00'
    },
    {
        id: 102,
        type: 'sick',
        typeName: '病假',
        startDate: '2024-01-03',
        endDate: '2024-01-03',
        days: 1,
        reason: '感冒发烧',
        status: 'approved',
        applyTime: '2024-01-03 08:30'
    }
];

function init() {
    updateClock();
    setInterval(updateClock, 1000);
    initNavigation();
    initHistoryData();
    renderLeaveList();
    renderApprovalLists();
    initDateInputs();
    initLeaveFormListeners();
}

function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeString = `${hours}:${minutes}:${seconds}`;
    document.getElementById('displayTime').textContent = timeString;
    
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const dateString = `${now.getFullYear()}年${String(now.getMonth() + 1).padStart(2, '0')}月${String(now.getDate()).padStart(2, '0')}日 ${days[now.getDay()]}`;
    document.getElementById('displayDate').textContent = dateString;
    
    const fullTimeString = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${hours}:${minutes}:${seconds}`;
    document.getElementById('currentTime').textContent = fullTimeString;
}

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('pageTitle');
    
    const titles = {
        'checkin': '打卡签到',
        'leave': '请假申请',
        'history': '打卡记录',
        'leave': '请假申请',
        'approval': '审批管理'
    };
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageName = item.dataset.page;
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(`${pageName}Page`).classList.add('active');
            
            pageTitle.textContent = titles[pageName];
        });
    });
}

function handleCheckin(type) {
    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    if (type === 'in') {
        checkinData.todayCheckin = now;
        document.getElementById('startTime').textContent = timeString;
        document.getElementById('checkinBtn').disabled = true;
        document.getElementById('checkoutBtn').disabled = false;
        
        const statusIcon = document.querySelector('.status-icon');
        const statusText = document.querySelector('.status-text');
        statusIcon.textContent = '✅';
        statusText.textContent = '已上班打卡';
        
        const hour = now.getHours();
        const minute = now.getMinutes();
        const statusEl = document.getElementById('attendanceStatus');
        
        if (hour > 9 || (hour === 9 && minute > 0)) {
            statusEl.textContent = '迟到';
            statusEl.className = 'stat-value status-warning';
            showToast('打卡成功，您今天迟到了', 'warning');
        } else {
            statusEl.textContent = '正常';
            statusEl.className = 'stat-value status-normal';
            showToast('上班打卡成功！', 'success');
        }
    } else {
        checkinData.todayCheckout = now;
        document.getElementById('endTime').textContent = timeString;
        document.getElementById('checkoutBtn').disabled = true;
        
        const statusIcon = document.querySelector('.status-icon');
        const statusText = document.querySelector('.status-text');
        statusIcon.textContent = '🎉';
        statusText.textContent = '今日打卡完成';
        
        if (checkinData.todayCheckin) {
            const diff = now - checkinData.todayCheckin;
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            document.getElementById('workHours').textContent = `${hours}小时${minutes}分钟`;
        }
        
        const hour = now.getHours();
        const minute = now.getMinutes();
        const statusEl = document.getElementById('attendanceStatus');
        
        if (hour < 18) {
            statusEl.textContent = '早退';
            statusEl.className = 'stat-value status-warning';
            showToast('打卡成功，您今天早退了', 'warning');
        } else {
            showToast('下班打卡成功！辛苦了！', 'success');
        }
    }
    
    const method = document.querySelector('input[name="checkinMethod"]:checked').value;
    const methodNames = {
        'gps': 'GPS定位',
        'qrcode': '二维码扫码',
        'face': '人脸识别',
        'fingerprint': '指纹识别'
    };
    
    console.log(`打卡方式: ${methodNames[method]}`);
}

function initHistoryData() {
    const historyData = [];
    const today = new Date();
    
    for (let i = 0; i < 22; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        if (date.getDay() === 0 || date.getDay() === 6) continue;
        
        const dayData = {
            date: formatDate(date),
            weekday: getWeekday(date.getDay()),
            checkIn: null,
            checkOut: null,
            status: 'normal'
        };
        
        if (i === 0) {
            dayData.checkIn = checkinData.todayCheckin ? formatTime(checkinData.todayCheckin) : '--:--';
            dayData.checkOut = checkinData.todayCheckout ? formatTime(checkinData.todayCheckout) : '--:--';
        } else {
            const random1 = Math.random();
            const random2 = Math.random();
            
            if (random1 > 0.1) {
                const hour = random1 > 0.9 ? 9 : 8;
                const minute = Math.floor(Math.random() * 59);
                dayData.checkIn = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                
                if (hour >= 9 && minute > 0) {
                    dayData.status = 'late';
                }
            } else {
                dayData.status = 'absent';
            }
            
            if (random2 > 0.05 && dayData.checkIn) {
                const hour = random2 < 0.1 ? 17 : 18;
                const minute = Math.floor(Math.random() * 59);
                dayData.checkOut = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                
                if (hour < 18 && dayData.status === 'normal') {
                    dayData.status = 'early';
                }
            }
        }
        
        historyData.push(dayData);
    }
    
    checkinData.history = historyData;
    renderHistoryTable();
}

function renderHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';
    
    checkinData.history.forEach(day => {
        const row = document.createElement('tr');
        
        const workHours = calculateWorkHours(day.checkIn, day.checkOut);
        
        const statusClass = day.status;
        const statusText = getStatusText(day.status);
        
        row.innerHTML = `
            <td>${day.date}</td>
            <td>${day.weekday}</td>
            <td>${day.checkIn || '--:--'}</td>
            <td>${day.checkOut || '--:--'}</td>
            <td>${workHours}</td>
            <td><span class="status-tag ${statusClass}">${statusText}</span></td>
        `;
        
        tbody.appendChild(row);
    });
}

function calculateWorkHours(checkIn, checkOut) {
    if (!checkIn || !checkOut || checkIn === '--:--' || checkOut === '--:--') {
        return '--'
    }
    
    const [inHour, inMin] = checkIn.split(':').map(Number);
    const [outHour, outMin] = checkOut.split(':').map(Number);
    
    const inMinutes = inHour * 60 + inMin;
    const outMinutes = outHour * 60 + outMin;
    
    const diff = outMinutes - inMinutes;
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    return `${hours}小时${minutes}分钟`;
}

function getStatusText(status) {
    const statusMap = {
        'normal': '正常',
        'late': '迟到',
        'early': '早退',
        'absent': '缺勤'
    };
    return statusMap[status] || '正常';
}

function formatDate(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getWeekday(day) {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return days[day];
}

function initDateInputs() {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    document.getElementById('historyStartDate').value = formatDate(startOfMonth);
    document.getElementById('historyEndDate').value = formatDate(today);
    
    const now = new Date();
    const leaveStart = document.getElementById('leaveStart');
    const leaveEnd = document.getElementById('leaveEnd');
    
    leaveStart.min = formatDate(now);
    leaveEnd.min = formatDate(now);
}

function filterHistory() {
    const startDate = document.getElementById('historyStartDate').value;
    const endDate = document.getElementById('historyEndDate').value;
    
    if (!startDate || !endDate) {
        showToast('请选择日期范围', 'error');
        return;
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
        showToast('开始日期不能大于结束日期', 'error');
        return;
    }
    
    const filtered = checkinData.history.filter(day => {
        const date = new Date(day.date);
        return date >= start && date <= end;
    });
    
    const tbody = document.getElementById('historyTableBody');
    tbody.innerHTML = '';
    
    filtered.forEach(day => {
        const row = document.createElement('tr');
        const workHours = calculateWorkHours(day.checkIn, day.checkOut);
        const statusClass = day.status;
        const statusText = getStatusText(day.status);
        
        row.innerHTML = `
            <td>${day.date}</td>
            <td>${day.weekday}</td>
            <td>${day.checkIn || '--:--'}</td>
            <td>${day.checkOut || '--:--'}</td>
            <td>${workHours}</td>
            <td><span class="status-tag ${statusClass}">${statusText}</span></td>
        `;
        
        tbody.appendChild(row);
    });
    
    showToast(`查询到 ${filtered.length} 条记录`, 'success');
}

function exportHistory(format) {
    showToast(`正在导出${format.toUpperCase()}文件...`, 'success');
    setTimeout(() => {
        showToast('导出成功！', 'success');
    }, 1500);
}

function initLeaveFormListeners() {
    const leaveStart = document.getElementById('leaveStart');
    const leaveEnd = document.getElementById('leaveEnd');
    
    leaveStart.addEventListener('change', calculateLeaveDays);
    leaveEnd.addEventListener('change', calculateLeaveDays);
}

function calculateLeaveDays() {
    const startDate = document.getElementById('leaveStart').value;
    const endDate = document.getElementById('leaveEnd').value;
    
    if (!startDate || !endDate) return;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (end < start) {
        showToast('结束时间不能早于开始时间', 'error');
        return;
    }
    
    let days = 0;
    const current = new Date(start);
    
    while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            days++;
        }
        current.setDate(current.getDate() + 1);
    }
    
    document.getElementById('leaveDays').value = `${days} 天`;
}

function submitLeaveForm(event) {
    event.preventDefault();
    
    const leaveType = document.getElementById('leaveType').value;
    const leaveStart = document.getElementById('leaveStart').value;
    const leaveEnd = document.getElementById('leaveEnd').value;
    const leaveDays = document.getElementById('leaveDays').value;
    const leaveReason = document.getElementById('leaveReason').value;
    const urgentLeave = document.getElementById('urgentLeave').checked;
    
    if (!leaveType || !leaveStart || !leaveEnd || !leaveReason) {
        showToast('请填写完整的请假信息', 'error');
        return;
    }
    
    const typeNames = {
        'sick': '病假',
        'personal': '事假',
        'annual': '年假',
        'marriage': '婚假',
        'maternity': '产假',
        'bereavement': '丧假'
    };
    
    const newApplication = {
        id: Date.now(),
        type: leaveType,
        typeName: typeNames[leaveType],
        startDate: leaveStart.split('T')[0],
        endDate: leaveEnd.split('T')[0],
        days: parseInt(leaveDays),
        reason: leaveReason,
        status: 'pending',
        applyTime: new Date().toLocaleString('zh-CN')
    };
    
    myApplications.unshift(newApplication);
    renderMyApplications();
    
    showToast('请假申请已提交，等待审批', 'success');
    resetLeaveForm();
}

function resetLeaveForm() {
    document.getElementById('leaveForm').reset();
    document.getElementById('leaveDays').value = '';
}

function renderLeaveList() {
    const leaveList = document.getElementById('leaveList');
    leaveList.innerHTML = '';
    
    myApplications.slice(0, 5).forEach(app => {
        const item = document.createElement('div');
        item.className = 'leave-item';
        
        const statusClass = app.status;
        const statusText = getStatusText(app.status);
        
        item.innerHTML = `
            <div class="leave-info">
                <h4>${app.typeName} (${app.days}天)</h4>
                <p>${app.startDate} 至 ${app.endDate}</p>
            </div>
            <span class="leave-status ${statusClass}">${statusText}</span>
        `;
        
        leaveList.appendChild(item);
    });
}

function renderApprovalLists() {
    renderPendingList();
    renderApprovedList();
    renderMyApplications();
    initApprovalTabs();
}

function initApprovalTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabs = document.querySelectorAll('.approval-tab');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            tabs.forEach(tab => tab.classList.remove('active'));
            document.getElementById(`${tabName}Tab`).classList.add('active');
        });
    });
}

function renderPendingList() {
    const pendingList = document.getElementById('pendingList');
    pendingList.innerHTML = '';
    
    const pending = leaveApplications.filter(app => app.status === 'pending');
    
    pending.forEach(app => {
        const card = createApprovalCard(app, true);
        pendingList.appendChild(card);
    });
}

function renderApprovedList() {
    const approvedList = document.getElementById('approvedList');
    approvedList.innerHTML = '';
    
    const approved = leaveApplications.filter(app => app.status !== 'pending');
    
    approved.forEach(app => {
        const card = createApprovalCard(app, false);
        approvedList.appendChild(card);
    });
}

function renderMyApplications() {
    const myApplicationList = document.getElementById('myApplicationList');
    myApplicationList.innerHTML = '';
    
    myApplications.forEach(app => {
        const card = createApprovalCard(app, false, true);
        myApplicationList.appendChild(card);
    });
}

function createApprovalCard(app, showActions, isMyApplication = false) {
    const card = document.createElement('div');
    card.className = 'approval-card';
    
    const statusClass = app.status;
    const statusText = getStatusText(app.status);
    
    let actionsHtml = '';
    if (showActions) {
        actionsHtml = `
            <div class="approval-actions">
                <button class="btn btn-success" onclick="approveLeave(${app.id})">批准</button>
                <button class="btn btn-danger" onclick="rejectLeave(${app.id})">拒绝</button>
            </div>
        `;
    }
    
    let applicantInfo = '';
    if (!isMyApplication) {
        applicantInfo = `
            <div class="approval-info-item">
                <span class="approval-info-label">申请人</span>
                <span class="approval-info-value">${app.applicant}</span>
            </div>
            <div class="approval-info-item">
                <span class="approval-info-label">部门</span>
                <span class="approval-info-value">${app.department}</span>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="approval-header">
            <div>
                <div class="approval-title">${app.typeName}申请</div>
                <div class="approval-time">申请时间: ${app.applyTime}</div>
            </div>
            <span class="leave-status ${statusClass}">${statusText}</span>
        </div>
        <div class="approval-content">
            <div class="approval-info">
                ${applicantInfo}
                <div class="approval-info-item">
                    <span class="approval-info-label">请假时间</span>
                    <span class="approval-info-value">${app.startDate} 至 ${app.endDate}</span>
                </div>
                <div class="approval-info-item">
                    <span class="approval-info-label">请假天数</span>
                    <span class="approval-info-value">${app.days} 天</span>
                </div>
            </div>
            <div class="approval-reason">${app.reason}</div>
        </div>
        ${actionsHtml}
    `;
    
    return card;
}

function approveLeave(id) {
    const app = leaveApplications.find(a => a.id === id);
    if (app) {
        app.status = 'approved';
        renderPendingList();
        renderApprovedList();
        showToast(`已批准 ${app.applicant} 的请假申请`, 'success');
    }
}

function rejectLeave(id) {
    const app = leaveApplications.find(a => a.id === id);
    if (app) {
        app.status = 'rejected';
        renderPendingList();
        renderApprovedList();
        showToast(`已拒绝 ${app.applicant} 的请假申请`, 'warning');
    }
}

function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

document.addEventListener('DOMContentLoaded', init);
