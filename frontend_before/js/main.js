document.addEventListener('DOMContentLoaded', () => {
    const queryInput = document.getElementById('queryInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchType = document.getElementById('searchType');
    const resultsSection = document.getElementById('resultsSection');
    const resultsList = document.getElementById('resultsList');
    const resultCount = document.getElementById('resultCount');
    const loadingOverlay = document.getElementById('loadingOverlay');

    const API_BASE_URL = 'http://localhost:5000';

    // 검색 실행 함수
    const performSearch = async () => {
        const query = queryInput.value.trim();
        const type = searchType.value;
        if (!query) {
            showToast('검색어를 입력하세요.', 'error');
            return;
        }

        // 상태 초기화
        loadingOverlay.style.display = 'block';
        resultsSection.style.display = 'none';
        resultsList.innerHTML = '';

        try {
            const response = await fetch(`${API_BASE_URL}/search`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query, searchType: type })
            });

            if (!response.ok) throw new Error('서버 응답 오류');

            const data = await response.json();
            // 백엔드에서 JSON 문자열로 올 수 있으므로 파싱 처리
            const resultData = typeof data === 'string' ? JSON.parse(data) : data;

            renderResults(resultData.slots || []);
        } catch (error) {
            console.error('Search Error:', error);
            alert('검색 중 오류가 발생했습니다. 백엔드 서버 상태를 확인하세요.');
        } finally {
            loadingOverlay.style.display = 'none';
        }
    };

    // 결과 렌더링 함수
    const renderResults = (slots) => {
        if (slots.length === 0) {
            showToast('검색 결과가 없습니다.', 'error');
            return;
        }

        resultsSection.style.display = 'block';
        resultCount.textContent = slots.length;

        slots.forEach(slot => {
            const prob = Math.round(slot.file_info.probability * 100);
            let probClass = 'card-theme-dark';
            if (prob >= 90) probClass = 'card-theme-green';
            else if (prob >= 80) probClass = 'card-theme-orange';
            else if (prob >= 50) probClass = 'card-theme-pink';
            else if (prob >= 30) probClass = 'card-theme-red';

            const card = document.createElement('div');
            card.className = `result-card ${probClass}`;
            card.innerHTML = `
                <div class="card-left">
                    <div class="file-header">
                        <span class="file-name">${slot.file_info.name}</span>
                        <span class="file-path">${slot.file_info.path}</span>
                    </div>
                    <div class="file-meta">
                        <div class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
                            <span>${slot.file_info.size || 'Unknown Size'}</span>
                        </div>
                        <div class="meta-item">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            <span>수정일: ${slot.file_info.modified || 'Unknown'}</span>
                        </div>
                    </div>
                </div>
                <div class="xai-module">
                    <div class="probability-indicator">${prob}% Match</div>
                    <span class="xai-title">${slot.type} Logic</span>
                    <p class="xai-text">${slot.xai_explanation}</p>
                </div>
            `;

            // 클릭 시 탐색기 실행
            card.addEventListener('click', () => openInExplorer(slot.file_info.path));
            resultsList.appendChild(card);
        });
    };

    // 탐색기 실행 요성 함수
    const openInExplorer = async (path) => {
        try {
            const response = await fetch(`${API_BASE_URL}/open_explorer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ path })
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
        } catch (error) {
            console.error('Explorer Open Error:', error);
            alert('탐색기를 여는 중 오류가 발생했습니다.');
        }
    };

    // 이벤트 리스너
    searchBtn.addEventListener('click', performSearch);
    queryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    tooltipTriggerList.forEach(el => new bootstrap.Tooltip(el))

    // Toast 메시지
    const showToast = (message, type = 'info') => {
        let toast = document.getElementById('toast');
        toast.textContent = message; // 메시지 설정
        toast.className = "toast show";
        setTimeout(() => {
            toast.className = toast.className.replace("show", "");
        }, 3000);
    };
});
