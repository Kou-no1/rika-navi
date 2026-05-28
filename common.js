/* ========================================================
   理科問題解決ナビ ツール群 共通スクリプト
   common.js
   ======================================================== */

(function() {
  'use strict';

  // ----- 班名管理 -----
  const TEAM_KEY = "rika-navi-team";

  window.RikaNavi = {
    getTeam() {
      return localStorage.getItem(TEAM_KEY) || "1班";
    },
    setTeam(name) {
      const v = (name || "").trim() || "1班";
      localStorage.setItem(TEAM_KEY, v);
      return v;
    },
    // ツール固有データのキー生成: 班ごとに分離
    storageKey(toolId) {
      return `rika-tool-${toolId}-${this.getTeam()}`;
    },
    // データ保存
    save(toolId, data) {
      try {
        localStorage.setItem(this.storageKey(toolId), JSON.stringify(data));
        return true;
      } catch(e) {
        console.error("save error", e);
        return false;
      }
    },
    // データ読込
    load(toolId, defaultData) {
      try {
        const raw = localStorage.getItem(this.storageKey(toolId));
        if (!raw) return defaultData;
        return Object.assign({}, defaultData, JSON.parse(raw));
      } catch(e) {
        return defaultData;
      }
    },
    // クリア
    clear(toolId) {
      localStorage.removeItem(this.storageKey(toolId));
    },
    // 全班分のキー一覧取得
    listKeysForTool(toolId) {
      const result = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(`rika-tool-${toolId}-`)) {
          result.push(k);
        }
      }
      return result;
    },
    // HTML エスケープ
    escapeHTML(s) {
      if (s == null) return "";
      return String(s)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#39;");
    },
    // クリップボードコピー
    copy(text) {
      return navigator.clipboard.writeText(text).then(
        () => { this.toast("📋 コピーしたよ!"); return true; },
        () => { this.toast("コピーできませんでした"); return false; }
      );
    },
    // トースト
    toast(msg) {
      let el = document.getElementById("rikaToast");
      if (!el) {
        el = document.createElement("div");
        el.id = "rikaToast";
        el.className = "toast";
        document.body.appendChild(el);
      }
      el.textContent = msg;
      el.classList.add("show");
      clearTimeout(window._rikaToastTimer);
      window._rikaToastTimer = setTimeout(() => el.classList.remove("show"), 2200);
    },
    // データの全エクスポート（JSON文字列）
    exportAll() {
      const all = {};
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith("rika-")) {
          all[k] = localStorage.getItem(k);
        }
      }
      return JSON.stringify(all, null, 2);
    },
    // 班一覧
    listTeams() {
      const teams = new Set();
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        const m = k && k.match(/^rika-tool-.+-(.+)$/);
        if (m) teams.add(m[1]);
      }
      return Array.from(teams);
    }
  };

  // ----- ヘッダー自動構築 -----
  // 各ツールHTMLで以下のメタデータを <body> に設定:
  //   data-step="3" data-tool-id="plan-navigator"
  //   data-tool-title="実験計画ナビゲーター"
  //   data-step-name="どうやって調べる？"
  document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const step = body.dataset.step;
    const toolTitle = body.dataset.toolTitle;
    const stepName = body.dataset.stepName;

    if (!toolTitle) return;

    const header = document.createElement("header");
    header.className = "tool-header";
    header.innerHTML = `
      <a href="../index.html" class="back-link" title="ナビに戻る">← ナビ</a>
      <div class="tool-header-info">
        <span class="tool-step-tag">STEP ${step} ${stepName || ""}</span>
        <div class="tool-title">${RikaNavi.escapeHTML(toolTitle)}</div>
      </div>
      <div class="team-input-wrap">
        <div class="team-label">班</div>
        <input type="text" class="team-input" id="rikaTeamInput" value="${RikaNavi.escapeHTML(RikaNavi.getTeam())}" placeholder="班名">
      </div>
    `;
    body.insertBefore(header, body.firstChild);

    // 班名入力監視
    const teamInput = document.getElementById("rikaTeamInput");
    teamInput.addEventListener("change", () => {
      const newTeam = RikaNavi.setTeam(teamInput.value);
      teamInput.value = newTeam;
      RikaNavi.toast(`🏷️ ${newTeam} に切り替えました`);
      // ページリロードでデータ再読込
      setTimeout(() => location.reload(), 600);
    });
  });

})();
