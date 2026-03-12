// ─────────────────────────────────────────
// 00. 설정
// ─────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:5000'; // Flask 백엔드 API 주소

// DOM 참조
const appContainer = document.getElementById('appContainer');
const mainContainer = document.getElementById('mainContainer');
const backBtnContainer = document.getElementById('backBtnContainer');
const backBtn = document.getElementById('backBtn');

// 아이콘 색상 유틸
function getIconByName(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        xlsx: 'fa-file-excel', xls: 'fa-file-excel',
        csv: 'fa-file-csv',
        pptx: 'fa-file-powerpoint', ppt: 'fa-file-powerpoint',
        docx: 'fa-file-word', doc: 'fa-file-word',
        pdf: 'fa-file-pdf',
        png: 'fa-file-image', jpg: 'fa-file-image',
        gif: 'fa-file-image', bmp: 'fa-file-image',
        js: 'fa-file-code', ts: 'fa-file-code',
        py: 'fa-file-code', html: 'fa-file-code',
        css: 'fa-file-code', java: 'fa-file-code',
        md: 'fa-file-alt', txt: 'fa-file-alt',
        json: 'fa-file-alt', xml: 'fa-file-alt',
        zip: 'fa-file-archive', rar: 'fa-file-archive',
        mp4: 'fa-file-video', avi: 'fa-file-video',
        mp3: 'fa-file-audio',
    };
    return map[ext] || 'fa-file';
}

// 앱 아이콘(홈 화면)
const APP_LIST = [
    { id: "file", name: "파일찾기", icon: "fa-search", color: "blue" },
    { id: "test1", name: "테스트 1", icon: "fa-vial", color: "green" },
    { id: "test2", name: "테스트 2", icon: "fa-vial", color: "orange" },
    { id: "test3", name: "테스트 3", icon: "fa-vial", color: "purple" },
    { id: "test4", name: "테스트 4", icon: "fa-vial", color: "red" },
    { id: "test5", name: "테스트 5", icon: "fa-vial", color: "yellow" },
    { id: "test6", name: "테스트 6", icon: "fa-vial", color: "blue" },
    { id: "link", name: "Link", icon: "fa-link", color: "gray" },
    { id: "settings", name: "Settings", icon: "fa-cog", color: "gray" },
    { id: "info", name: "Info", icon: "fa-info-circle", color: "blue" },
];

// ─────────────────────────────────────────
// 01. 공통, 메인
// ─────────────────────────────────────────

// 초기 로딩
document.addEventListener('DOMContentLoaded', () => {
    renderAppGrid(); // 홈 화면(앱 그리드)
});

// 뒤로가기 버튼
if (backBtn) {
    backBtn.addEventListener('click', () => {
        renderAppGrid();
    });
}

// Toast 메시지
const showToast = (message, type) => {
    let toast = document.getElementById('toast');
    toast.textContent = message; // 메시지 설정
    if (type === 'error') {
        toast.className = "toast error show";
    } else if (type === 'info') {
        toast.className = "toast info show";
    } else if (type === 'success') {
        toast.className = "toast success show";
    } else {
        toast.className = "toast show";
    }
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
    }, 1000);
};

// HTML 부분랜더
async function router(path) {
    const container = document.getElementById('viewContainer');
    try {
        const res = await fetch(path);
        const html = await res.text();
        container.innerHTML = html;
        return true; // 성공적으로 렌더링됨을 알림
    } catch (err) {
        showToast('HTML 렌더링 오류', 'error');
    }
}

// 앱 아이콘 EVENT 매핑
function renderAppGrid() {
    viewContainer.innerHTML = '';
    backBtnContainer.classList.remove('active');
    appContainer.classList.remove('list-view');
    appContainer.classList.add('grid-view');
    appContainer.innerHTML = '';
    appContainer.classList.add('active');

    APP_LIST.forEach(app => {
        let html = '';
        if (app.id === "file") {
            html = `
                <div class="app-item" id="btnOpenSearch">
                    <div class="app-icon ${app.color}">
                        <i class="fas ${app.icon}"></i>
                    </div>
                    <div class="app-name" title="${app.name}">${app.name}</div>
                </div>
            `;
        }
        else if (app.id === "link") {
            html = `
                <div class="app-item" id="btnOpenLink">
                    <div class="app-icon ${app.color}">
                        <i class="fas ${app.icon}"></i>
                    </div>
                    <div class="app-name" title="${app.name}">${app.name}</div>
                </div>
            `;
        } else if (app.id === "settings") {
            html = `
                <div class="app-item" id="btnOpenSettings">
                    <div class="app-icon ${app.color}">
                        <i class="fas ${app.icon}"></i>
                    </div>
                    <div class="app-name" title="${app.name}">${app.name}</div>
                </div>
            `;
        } else {
            html = `
                <div class="app-item">
                    <div class="app-icon ${app.color}">
                        <i class="fas ${app.icon}"></i>
                    </div>
                    <div class="app-name" title="${app.name}">${app.name}</div>
                </div>
            `;
        }

        appContainer.insertAdjacentHTML('beforeend', html);
    });
    // [파일찾기] 아이콘 → 검색화면 진입
    const btnOpenSearch = document.getElementById('btnOpenSearch');
    if (btnOpenSearch) {
        btnOpenSearch.addEventListener('click', async () => {
            await router('./frontend/html/apps/fileSearch.html'); // html render
            let searchInput = document.getElementById('searchInput');
            let searchBtn = document.getElementById('searchBtn');
            let searchIcon = document.getElementById('searchIcon');
            let searchSpinner = document.getElementById('searchSpinner');

            // 파일찾기 영역 init
            searchIcon.style.display = 'block';
            searchSpinner.style.display = 'none';
            searchBtn.disabled = false;
            searchInput.focus();

            // Main 영역 init
            backBtnContainer.classList.add('active');
            appContainer.innerHTML = '';
            appContainer.classList.remove('active');
            appContainer.classList.remove('grid-view');

            // event
            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', e => {
                if (e.key === 'Enter') performSearch();
            });
        });
    }
    // [Link] 아이콘 → 링크화면 진입
    const btnOpenLink = document.getElementById('btnOpenLink');
    if (btnOpenLink) {
        btnOpenLink.addEventListener('click', async () => {
            await router('./frontend/html/apps/link.html'); // html render

            let links = [
                {
                    icon: "fa-solid fa-building",
                    name: "NAEDAM C&C",
                    path: "http://www.ndcc.co.kr/"
                },
                {
                    icon: "fa-solid fa-square-rss",
                    color: "#000000",
                    name: "Chat GPT",
                    path: "https://chatgpt.com/"
                },
                {
                    icon: "fa-solid fa-square-rss",
                    color: "#319efdff",
                    name: "GEMINI",
                    path: "https://gemini.google.com/"
                },
                {
                    icon: "fa-brands fa-youtube",
                    color: "#ef4444",
                    name: "Youtube",
                    path: "https://www.youtube.com/"
                },
                {
                    icon: "fa-brands fa-google",
                    color: "#3b82f6",
                    name: "Google",
                    path: "https://www.google.com/"
                },
                {
                    icon: "fa-brands fa-github",
                    color: "#000000",
                    name: "GitHub",
                    path: "https://github.com/"
                },
                {
                    icon: "fa-solid fa-share-from-square",
                    color: "#1c7e57ff",
                    name: "장고실습",
                    path: "http://127.0.0.1:8000/"
                },
            ];


            // Main 영역 init
            backBtnContainer.classList.add('active');
            appContainer.classList.remove('active');
            appContainer.classList.remove('grid-view');
            appContainer.innerHTML = '';

            // link 리스트 set
            const resultsContainer = document.getElementById('resultsContainer');
            resultsContainer.innerHTML = '';
            resultsContainer.classList.add('active');
            resultsContainer.classList.add('list-view');
            links.forEach(link => {
                resultsContainer.insertAdjacentHTML('beforeend', renderLinkResult(link));
            });

            // 정확히 3개 아이템 높이 기준으로 maxHeight 동적 적용
            let items = resultsContainer.querySelectorAll('.result-item');
            if (items.length > 3) {
                // 결과 클릭 → 파일 탐색기에서 열기
                items.forEach(el => {
                    el.addEventListener('click', () => {
                        const path = el.dataset.path;
                        if (path) openInNewWindow(path);
                    });
                });

                // 3번째 아이템의 하단 위치 = 컨테이너 상단 기준 offsetTop + offsetHeight
                const containerTop = resultsContainer.getBoundingClientRect().top + resultsContainer.scrollTop;
                const thirdItem = items[2];
                const thirdBottom = thirdItem.getBoundingClientRect().bottom - resultsContainer.getBoundingClientRect().top + resultsContainer.scrollTop;
                resultsContainer.style.maxHeight = thirdBottom + 'px';
            }
        });
    }
    // [Settings] 아이콘 → 링크화면 진입
    const btnOpenSettings = document.getElementById('btnOpenSettings');
    if (btnOpenSettings) {
        btnOpenSettings.addEventListener('click', () => {
            alert('Settings');
        });
    }

}

// ─────────────────────────────────────────
// 02. 파일찾기
// ─────────────────────────────────────────

// 실제 검색: Flask API 호출
const performSearch = async () => {
    const query = searchInput.value.trim();
    const resultsContainer = document.getElementById('resultsContainer');


    // 검색어 없으면 → toast 메시지
    if (!query) {
        showToast('검색어를 입력하세요.', 'info');
        return;
    }

    // UI 로딩 상태
    searchIcon.style.display = 'none';
    searchSpinner.style.display = 'block';
    searchBtn.disabled = true;
    resultsContainer.innerHTML = '';
    resultsContainer.classList.remove('grid-view');
    resultsContainer.classList.add('list-view');
    resultsContainer.classList.add('active');
    resultsContainer.style.maxHeight = 'none';  // 렌더링 전에는 풍어됩니다
    resultsContainer.style.overflowY = 'auto';

    try {
        // app.py → search 호출
        const response = await fetch(`${API_BASE}/search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query.toLowerCase(), searchType: 'name' })
        });

        if (!response.ok) throw new Error(`서버 오류: ${response.status}`);

        const data = await response.json();

        // 로딩 복구
        searchIcon.style.display = 'block';
        searchSpinner.style.display = 'none';
        searchBtn.disabled = false;

        // slots 배열에서 file_info 추출 (기존 API 반환 형식)
        const slots = data.slots || [];
        const files = slots.map(s => s.file_info).filter(Boolean); // 제한 없이 전부 가져옴

        if (files.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search-minus" style="font-size:2rem;margin-bottom:1rem;color:#475569;"></i>
                    <h3>'${query}'에 대한 결과가 없습니다.</h3>
                    <p style="margin-top:0.5rem;font-size:0.9rem;">다른 검색어를 입력해 보세요.</p>
                </div>
            `;
        } else {
            files.forEach(file => {
                resultsContainer.insertAdjacentHTML('beforeend', renderFileResult(file, query));
            });

            // 결과 클릭 → 파일 탐색기에서 열기
            resultsContainer.querySelectorAll('.result-item').forEach(el => {
                el.addEventListener('click', () => {
                    const path = el.dataset.path;
                    if (path) openInExplorer(path);
                });
            });

            // 정확히 3개 아이템 높이 기준으로 maxHeight 동적 적용
            const items = resultsContainer.querySelectorAll('.result-item');
            if (items.length > 3) {
                // 3번째 아이템의 하단 위치 = 컨테이너 상단 기준 offsetTop + offsetHeight
                const containerTop = resultsContainer.getBoundingClientRect().top + resultsContainer.scrollTop;
                const thirdItem = items[2];
                const thirdBottom = thirdItem.getBoundingClientRect().bottom - resultsContainer.getBoundingClientRect().top + resultsContainer.scrollTop;
                resultsContainer.style.maxHeight = thirdBottom + 'px';
            }
        }

    } catch (err) {
        searchIcon.style.display = 'block';
        searchSpinner.style.display = 'none';
        searchBtn.disabled = false;
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-exclamation-triangle" style="font-size:2rem;margin-bottom:1rem;color:#ef4444;"></i>
                <h3>백엔드 연결 오류</h3>
                <p style="margin-top:0.5rem;font-size:0.9rem;">${err.message}</p>
                <p style="margin-top:0.3rem;font-size:0.85rem;color:#64748b;">Flask 서버(http://127.0.0.1:5000)가 실행 중인지 확인하세요.</p>
            </div>
        `;
    }
};

// 탐색기에서 파일 열기 (Flask API 활용)
async function openInExplorer(path) {
    try {
        await fetch(`${API_BASE}/open_explorer`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path })
        });
    } catch (e) {
        console.warn('탐색기 열기 실패:', e);
    }
}

// 검색어 하이라이트
function highlightMatch(text, query) {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index >= 0) {
        const before = text.substring(0, index);
        const match = text.substring(index, index + query.length);
        const after = text.substring(index + query.length);
        return `${before}<span style="color:#60a5fa;font-weight:bold;background:rgba(96,165,250,0.2);border-radius:4px;padding:0 2px;">${match}</span>${after}`;
    }
    return text;
}

// 확장자 아이콘
function getIconColorHex(iconClass) {
    if (iconClass.includes('excel') || iconClass.includes('csv')) return '#22c55e';
    if (iconClass.includes('powerpoint')) return '#f97316';
    if (iconClass.includes('word')) return '#3b82f6';
    if (iconClass.includes('pdf')) return '#ef4444';
    if (iconClass.includes('image')) return '#a855f7';
    if (iconClass.includes('code')) return '#eab308';
    if (iconClass.includes('archive')) return '#f97316';
    if (iconClass.includes('video')) return '#06b6d4';
    if (iconClass.includes('audio')) return '#ec4899';
    return '#60a5fa';
}

// 검색 결과 렌더링 (목록형)
function renderFileResult(item, query) {
    const icon = getIconByName(item.name);
    const iconColor = getIconColorHex(icon);
    const fileDir = item.path.replace(/[\\/][^\\/]+$/, ''); // 경로에서 파일명 제거

    return `
        <div class="result-item" data-path="${item.path}" title="클릭하여 탐색기에서 열기">
            <div class="file-icon" style="color:${iconColor};background:${iconColor}22;">
                <i class="fas ${icon}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${highlightMatch(item.name, query)}</div>
                <div class="file-meta">
                    <span class="file-size">${item.size}</span>
                    <span class="file-path" title="${fileDir}">
                        <i class="fas fa-folder-open" style="margin-right:4px;"></i>${fileDir}
                    </span>
                </div>
                <div class="file-meta" style="margin-top:0.3rem;">
                    <span class="file-modified" title="최종 수정일">
                        <i class="far fa-clock" style="margin-right:4px;"></i>${item.modified}
                    </span>
                </div>
            </div>
        </div>
    `;
}

// ─────────────────────────────────────────
// 03. 링크
// ─────────────────────────────────────────

// 링크 렌더링 (목록형)
function renderLinkResult(item) {
    let color = '';
    if (item.color == '' || item.color == null) {
        color = '#1278a4ff';
    } else {
        color = item.color;
    }
    return `
        <div class="result-item" data-path="${item.path}" title="${item.name}">
            <div class="file-icon" style="color:${color};background:#ffffff;">
                <i class="${item.icon}"></i>
            </div>
            <div class="file-info">
                <div class="file-name">${item.name}</div>
                <div class="file-meta">
                    <span class="file-path" title="${item.path}">
                        <i class="fas fa-link" style="margin-right:4px;"></i>${item.path}
                    </span>
                </div>
            </div>
        </div>
    `;
};

// 새 창에서 링크 열기
async function openInNewWindow(path) {
    try {
        window.open(path, '_blank');
    } catch (e) {
        showToast('링크를 여는 중 문제가 발생했습니다.', 'error');
    }
}