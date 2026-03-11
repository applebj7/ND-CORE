// ─────────────────────────────────────────
//  설정: Flask 백엔드 API 주소
// ─────────────────────────────────────────
const API_BASE = 'http://127.0.0.1:5000';

// DOM 참조
const searchInput        = document.getElementById('searchInput');
const searchBtn          = document.getElementById('searchBtn');
const searchIcon         = document.getElementById('searchIcon');
const searchSpinner      = document.getElementById('searchSpinner');
const resultsContainer   = document.getElementById('resultsContainer');
const mainContainer      = document.getElementById('mainContainer');
const searchBox          = document.querySelector('.search-box');
const backBtnContainer   = document.getElementById('backBtnContainer');
const backBtn            = document.getElementById('backBtn');

// ─────────────────────────────────────────
//  아이콘 색상 유틸
// ─────────────────────────────────────────
function getIconByName(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const map = {
        xlsx: 'fa-file-excel',   xls: 'fa-file-excel',
        csv:  'fa-file-csv',
        pptx: 'fa-file-powerpoint', ppt: 'fa-file-powerpoint',
        docx: 'fa-file-word',    doc: 'fa-file-word',
        pdf:  'fa-file-pdf',
        png:  'fa-file-image',   jpg: 'fa-file-image',
        gif:  'fa-file-image',   bmp: 'fa-file-image',
        js:   'fa-file-code',    ts: 'fa-file-code',
        py:   'fa-file-code',    html: 'fa-file-code',
        css:  'fa-file-code',    java: 'fa-file-code',
        md:   'fa-file-alt',     txt: 'fa-file-alt',
        json: 'fa-file-alt',     xml: 'fa-file-alt',
        zip:  'fa-file-archive', rar: 'fa-file-archive',
        mp4:  'fa-file-video',   avi: 'fa-file-video',
        mp3:  'fa-file-audio',
    };
    return map[ext] || 'fa-file';
}

function getIconColorHex(iconClass) {
    if (iconClass.includes('excel') || iconClass.includes('csv'))       return '#22c55e';
    if (iconClass.includes('powerpoint'))                               return '#f97316';
    if (iconClass.includes('word'))                                     return '#3b82f6';
    if (iconClass.includes('pdf'))                                      return '#ef4444';
    if (iconClass.includes('image'))                                    return '#a855f7';
    if (iconClass.includes('code'))                                     return '#eab308';
    if (iconClass.includes('archive'))                                  return '#f97316';
    if (iconClass.includes('video'))                                    return '#06b6d4';
    if (iconClass.includes('audio'))                                    return '#ec4899';
    return '#60a5fa';
}

// ─────────────────────────────────────────
//  검색어 하이라이트
// ─────────────────────────────────────────
function highlightMatch(text, query) {
    if (!query) return text;
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index >= 0) {
        const before = text.substring(0, index);
        const match  = text.substring(index, index + query.length);
        const after  = text.substring(index + query.length);
        return `${before}<span style="color:#60a5fa;font-weight:bold;background:rgba(96,165,250,0.2);border-radius:4px;padding:0 2px;">${match}</span>${after}`;
    }
    return text;
}

// ─────────────────────────────────────────
//  검색 결과 렌더링 (목록형)
// ─────────────────────────────────────────
function renderFileResult(item, query) {
    const icon      = getIconByName(item.name);
    const iconColor = getIconColorHex(icon);
    const fileDir   = item.path.replace(/[\\/][^\\/]+$/, ''); // 경로에서 파일명 제거

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
//  앱 아이콘 그리기 (홈 화면)
// ─────────────────────────────────────────
const APP_LIST = [
    { name: "파일찾기",  icon: "fa-search",       color: "blue"   },
    { name: "테스트 1",  icon: "fa-vial",          color: "green"  },
    { name: "테스트 2",  icon: "fa-vial",          color: "orange" },
    { name: "테스트 3",  icon: "fa-vial",          color: "purple" },
    { name: "테스트 4",  icon: "fa-vial",          color: "red"    },
    { name: "테스트 5",  icon: "fa-vial",          color: "yellow" },
    { name: "테스트 6",  icon: "fa-vial",          color: "blue"   },
    { name: "테스트 7",  icon: "fa-vial",          color: "gray"   },
    { name: "Settings", icon: "fa-cog",            color: "gray"   },
    { name: "Info",      icon: "fa-info-circle",   color: "blue"   },
];

function renderAppGrid() {
    searchBox.style.display = 'none';
    backBtnContainer.classList.remove('active');
    resultsContainer.classList.remove('list-view');
    resultsContainer.classList.add('grid-view');
    resultsContainer.innerHTML = '';
    resultsContainer.classList.add('active');

    APP_LIST.forEach(app => {
        const isSearchApp = app.name === "파일찾기";
        const html = `
            <div class="app-item" ${isSearchApp ? 'id="btnOpenSearch"' : ''}>
                <div class="app-icon ${app.color}">
                    <i class="fas ${app.icon}"></i>
                </div>
                <div class="app-name" title="${app.name}">${app.name}</div>
            </div>
        `;
        resultsContainer.insertAdjacentHTML('beforeend', html);
    });

    // 파일찾기 아이콘 → 검색화면 진입
    const btnOpenSearch = document.getElementById('btnOpenSearch');
    if (btnOpenSearch) {
        btnOpenSearch.addEventListener('click', () => {
            searchBox.style.display = 'flex';
            backBtnContainer.classList.add('active');
            resultsContainer.classList.remove('active');
            resultsContainer.innerHTML = '';
            searchInput.focus();
        });
    }

    // 로딩 상태 복구
    searchIcon.style.display = 'block';
    searchSpinner.style.display = 'none';
    searchBtn.disabled = false;
}

// ─────────────────────────────────────────
//  실제 검색: Flask API 호출
// ─────────────────────────────────────────
const performSearch = async () => {
    const query = searchInput.value.trim();

    // 검색어 없으면 → 홈 화면
    if (!query) {
        renderAppGrid();
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

// ─────────────────────────────────────────
//  탐색기에서 파일 열기 (Flask API 활용)
// ─────────────────────────────────────────
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

// ─────────────────────────────────────────
//  이벤트 리스너
// ─────────────────────────────────────────
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', e => {
    if (e.key === 'Enter') performSearch();
});

// 뒤로가기 버튼
if (backBtn) {
    backBtn.addEventListener('click', () => {
        searchInput.value = '';
        renderAppGrid();
    });
}

// 초기 로딩 → 홈 화면(앱 그리드)
document.addEventListener('DOMContentLoaded', () => {
    renderAppGrid();
});
