import { caseLoaders } from './route';
import './style.css';



function getCaseFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('case') || 'gltf';
}

function setActiveLink(current) {
  const links = document.querySelectorAll('.sidebar__link');
  links.forEach((a) => {
    if (a.dataset.case === current) {
      a.style.background = '#1a1d20';
      a.style.color = '#fff';
    } else {
      a.style.background = 'transparent';
      a.style.color = '#c7c9cc';
    }
  });
}

let currentCleanup = null;

async function loadCase() {
  const stage = document.getElementById('stage');
  if (!stage) return;

  // 调用上一个用例的清理函数
  if (typeof currentCleanup === 'function') {
    try { currentCleanup(); } catch (e) { console.warn('cleanup error', e); }
    currentCleanup = null;
  }

  // 清空舞台
  Array.from(stage.querySelectorAll('canvas')).forEach((c) => c.remove());

  const key = getCaseFromURL();
  setActiveLink(key);
  const mod = await (caseLoaders[key] || caseLoaders.gltf)();

  // 兼容两种导出：默认导出 mount，或导出对象 { mount, cleanup }
  if (typeof mod.mount === 'function') {
    currentCleanup = mod.mount(stage) || null;
  } else if (typeof mod.default === 'function') {
    currentCleanup = mod.default(stage) || null;
  } else {
    // 回退：如果模块是立即执行型（旧实现），尝试不传参执行并无法提供清理
    if (typeof mod.default === 'object' || typeof mod === 'object') {
      // do nothing, already executed on import
    }
  }
}

function bindSidebar() {
  const nav = document.querySelector('.sidebar__nav');
  if (!nav) return;
  nav.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.matches('a[data-case]')) {
      e.preventDefault();
      const value = target.getAttribute('data-case');
      const url = new URL(window.location.href);
      url.searchParams.set('case', value);
      history.pushState({}, '', url);
      loadCase();
    }
  });
}

window.addEventListener('popstate', loadCase);

bindSidebar();
loadCase();
