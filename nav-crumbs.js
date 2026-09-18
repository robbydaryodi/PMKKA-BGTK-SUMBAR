
document.addEventListener("DOMContentLoaded", () => {
    // Determine context based on URL and title
    const path = window.location.pathname;
    const search = window.location.search;
    
    let portalName = "";
    
    if (path.includes('fasilitator.html')) {
        portalName = "Portal Fasilitator";
    } else if (path.includes('ruang-kelas.html')) {
        portalName = "Ruang Kelas Daring (GMeet & Rekaman)";
    } else if (path.includes('submit-peserta-fkk.html')) {
        portalName = "Status Seleksi & Ruang Kelas";
    } else if (path.includes('konfirmasi-kehadiran.html')) {
        portalName = "Konfirmasi Sekolah";
    } else if (path.includes('kehadiran.html')) {
        portalName = "Daftar Hadir Digital";
    } else if (path.includes('index.html') && search.includes('view=admin')) {
        portalName = "Dasbor Admin";
    } else if (path.includes('index.html') || path.endsWith('/')) {
        // Main Gateway, no crumbs needed
        return;
    }
    
    if (!portalName) return; // Fallback
    
    // Create breadcrumb container
    const crumbHtml = `
        <div class="bg-indigo-50 border-b border-indigo-100 py-2 hidden sm:block">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <nav class="flex text-sm text-indigo-700 font-medium" aria-label="Breadcrumb">
                    <ol class="inline-flex items-center space-x-1 md:space-x-3">
                        <li class="inline-flex items-center">
                            <a href="index.html" class="inline-flex items-center hover:text-indigo-900 transition-colors">
                                <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path></svg>
                                Beranda
                            </a>
                        </li>
                        <li>
                            <div class="flex items-center">
                                <svg class="w-5 h-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                                <span class="ml-1 md:ml-2" id="bc-portal-name">${portalName}</span>
                            </div>
                        </li>
                        <li id="bc-context-li" class="hidden">
                            <div class="flex items-center">
                                <svg class="w-5 h-5 text-indigo-300" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path></svg>
                                <span class="ml-1 md:ml-2 text-slate-500 font-normal truncate max-w-xs" id="bc-context-name"></span>
                            </div>
                        </li>
                    </ol>
                </nav>
            </div>
        </div>
    `;
    
    // Inject right after navbar, or at the top of the body for kehadiran.html
    const nav = document.querySelector('nav');
    if (nav) {
        nav.insertAdjacentHTML('afterend', crumbHtml);
    } else {
        document.body.insertAdjacentHTML('afterbegin', crumbHtml);
    }
});

// Function to update the third breadcrumb level dynamically
window.updateBreadcrumbContext = function(contextName) {
    const li = document.getElementById('bc-context-li');
    const span = document.getElementById('bc-context-name');
    if (li && span) {
        if (contextName) {
            span.textContent = contextName;
            li.classList.remove('hidden');
        } else {
            li.classList.add('hidden');
        }
    }
};
