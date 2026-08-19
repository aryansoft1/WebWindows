const scaleSelect = document.getElementById("scaleSelect");

function getDesktopHost() {
    return window.parent && window.parent !== window ? window.parent : window;
}

function applyDesktopScale(scale) {
    const host = getDesktopHost();
    if (typeof host.setDesktopScale === "function") {
        host.setDesktopScale(scale);
    } else {
        host.postMessage({ type: "set-desktop-scale", scale }, window.location.origin);
    }
}

scaleSelect.addEventListener("change", () => applyDesktopScale(scaleSelect.value));

window.addEventListener("DOMContentLoaded", () => {
    const savedScale = localStorage.getItem("ui-scale") || 1;

    document.getElementById("scaleSelect").value = savedScale;

    // 分辨率显示
    document.getElementById("resolutionInfo").innerText =
        `${screen.width} × ${screen.height} （设备像素比: ${window.devicePixelRatio}）`;

    const langSelect = document.getElementById("langSelect");
    langSelect.value = localStorage.getItem("lang") || "zh";
    langSelect.addEventListener("change", () => {
        const host = getDesktopHost();
        if (typeof host.setLanguage === "function") {
            host.setLanguage(langSelect.value);
        } else {
            host.localStorage.setItem("lang", langSelect.value);
            host.localStorage.setItem("webwindows.language.source", "manual");
            host.localStorage.setItem("webwindows.language.migration", "2026.08.19.1");
            host.postMessage({ type: "change-language", lang: langSelect.value }, window.location.origin);
        }
    });
    const host = getDesktopHost();
    const regions = host.WebWindowsLocale?.REGIONS || {
        CN: { code: "CN", locale: "zh-CN", timeZone: "Asia/Shanghai" },
        JP: { code: "JP", locale: "ja-JP", timeZone: "Asia/Tokyo" },
        TW: { code: "TW", locale: "zh-TW", timeZone: "Asia/Taipei" },
        US: { code: "US", locale: "en-US", timeZone: "America/New_York" }
    };
    const regionSelect = document.getElementById("regionSelect");
    const savedRegion = host.localStorage.getItem("webwindows.region") || "CN";
    regionSelect.value = regions[savedRegion] ? savedRegion : "CN";
    regionSelect.addEventListener("change", () => {
        const setting = regions[regionSelect.value] || regions.CN;
        if (host.WebWindowsLocale) host.WebWindowsLocale.setRegion(setting.code, { source: "manual" });
        else {
            host.localStorage.setItem("webwindows.region", setting.code);
            host.localStorage.setItem("webwindows.timeZone", setting.timeZone);
            host.localStorage.setItem("webwindows.region.source", "manual");
            host.dispatchEvent(new CustomEvent("webwindows:region-changed", { detail: setting }));
        }
    });

    const requestedTab = new URLSearchParams(window.location.search).get("tab");
    const tabId = requestedTab === "network" ? "networkTab" : `${requestedTab || ""}Tab`;
    const tabButton = document.querySelector(`[data-settings-tab="${tabId}"]`);
    if (tabButton) switchTab(tabButton, tabId);

    const device = host.WebWindows?.device;
    const controlState = { volume: null, brightness: null };
    const volumeInput = document.getElementById("masterVolume");
    const brightnessInput = document.getElementById("visualBrightness");
    const volumeOutput = document.getElementById("masterVolumeValue");
    const brightnessOutput = document.getElementById("visualBrightnessValue");

    function applyControl(control, value) {
        const target = control === "volume" ? device?.audio : device?.display;
        const method = control === "volume" ? target?.setVolume : target?.setBrightness;
        if (method) return method.call(target, value);
        host.postMessage({ type: "webwindows:set-device-control", control, value }, window.location.origin);
        return Promise.resolve({ supported: false, source: "unsupported" });
    }

    function renderControl(control, state) {
        const input = control === "volume" ? volumeInput : brightnessInput;
        const output = control === "volume" ? volumeOutput : brightnessOutput;
        if (!input || !output) return;
        const value = Number(state?.value);
        const available = state?.supported !== false && Number.isFinite(value);
        input.classList.toggle("is-unavailable", !available);
        input.setAttribute("aria-valuetext", available ? `${Math.round(value * 100)}%` : "不可读取");
        if (!available) {
            output.value = "不可读取";
            input.style.setProperty("--range-progress", "0%");
            return;
        }
        controlState[control] = Math.max(0, Math.min(1, value));
        const percent = Math.round(controlState[control] * 100);
        input.value = String(percent);
        output.value = `${percent}%`;
        input.style.setProperty("--range-progress", `${percent}%`);
    }

    if (volumeInput && brightnessInput && volumeOutput && brightnessOutput) {
        const audioCapability = device?.audio.getCapabilities().volume || { supported: false, scope: "page" };
        const brightnessCapability = device?.display.getCapabilities().brightness || { supported: false, scope: "visual" };
        document.getElementById("volumeCapabilityNote").textContent = audioCapability.scope === "native"
            ? "由受信任外壳调节设备媒体音量；WebWindows 页面音视频也会同步。"
            : "调节 WebWindows 页面中的同源音视频音量，不代表系统硬件音量；跨域内容可能不受控制。";
        document.getElementById("brightnessCapabilityNote").textContent = brightnessCapability.scope === "native"
            ? "由受信任外壳调节设备屏幕亮度。"
            : "调节 WebWindows 页面视觉亮度，不代表屏幕背光。";
        brightnessInput.addEventListener("input", () => {
            const next = Number(brightnessInput.value) / 100;
            renderControl("brightness", { supported: true, value: next });
            applyControl("brightness", next).then((state) => renderControl("brightness", state)).catch((error) => console.warn("[Settings]", error));
        });
        volumeInput.addEventListener("input", () => {
            const next = Number(volumeInput.value) / 100;
            renderControl("volume", { supported: true, value: next });
            applyControl("volume", next).then((state) => renderControl("volume", state)).catch((error) => console.warn("[Settings]", error));
        });

        host.addEventListener("webwindows:volume-change", (event) => renderControl("volume", event.detail));
        host.addEventListener("webwindows:display-change", (event) => renderControl("brightness", event.detail));
        Promise.resolve(device?.ready?.()).then(async () => {
            const [volumeState, brightnessState] = await Promise.all([
                device?.audio.refresh?.() || device?.audio.getVolume(),
                device?.display.refresh?.() || device?.display.getBrightness()
            ]);
            renderControl("volume", volumeState);
            renderControl("brightness", brightnessState);
        }).catch((error) => console.warn("[Settings]", error));
    }

    function setPowerText(id, value) {
        const element = document.getElementById(id);
        if (element) element.textContent = value;
    }

    function renderPowerState() {
        const power = device?.power.getState() || {
            supported: false, source: "unknown", acConnected: null, batteryPresent: null
        };
        const battery = device?.battery.getState() || {
            supported: false, present: null, level: null, charging: null
        };
        setPowerText("power-source", power.source === "ac" ? "交流电" : power.source === "battery" ? "电池" : "未知");
        setPowerText("power-ac-connected", power.acConnected === true ? "已连接" : power.acConnected === false ? "未连接" : "未知");
        setPowerText("power-battery-present", battery.present === true ? "已安装" : battery.present === false ? "无电池" : "未知");
        setPowerText("power-battery-level", Number.isFinite(battery.level) ? `${Math.round(battery.level * 100)}%` : "未知");
        setPowerText("power-battery-charging", battery.charging === true ? "正在充电" : battery.charging === false ? "未充电" : "未知");
        const note = document.getElementById("powerCapabilityNote");
        if (note) note.textContent = power.supported
            ? "电源来源与电池是否存在分别显示；当前数据由宿主或浏览器能力提供。"
            : "当前浏览器或宿主不提供电源结构，相关项目明确显示为“未知”。";
    }

    device?.ready().then(renderPowerState);
    host.addEventListener?.("webwindows:battery-change", renderPowerState);
});

(function initializeFunctionManager() {
    "use strict";

    let pendingRemoval = null;

    function registryApi() {
        return getDesktopHost().WebWindows?.apps || null;
    }

    function setManagerStatus(message, isError) {
        const element = document.getElementById("functionManagerStatus");
        if (!element) return;
        element.textContent = message || "";
        element.classList.toggle("is-error", Boolean(isError));
    }

    function currentScopeLabel() {
        try {
            const host = getDesktopHost();
            const user = JSON.parse(host.sessionStorage.getItem("webwindows_user") || "null");
            if (!user) return "本机使用者 · 仅本机";
            const state = host.WebWindows?.functionSync?.getState?.();
            const suffix = {
                syncing: "同步中",
                synced: "已同步",
                offline: "离线待同步",
                error: "等待重试",
                local: "仅本机"
            }[state?.status] || "准备同步";
            return `${user.nickname || user.username || "登录账户"} · ${suffix}`;
        } catch (_) {
            return "本机使用者 · 仅本机";
        }
    }

    function updateScopeBadge() {
        const scope = document.getElementById("functionScopeBadge");
        if (scope) scope.textContent = currentScopeLabel();
    }

    function sourceLabel(source) {
        const labels = {
            preinstalled: "预置功能",
            repository: "功能仓库",
            local: "本机关联",
            test: "测试关联"
        };
        return labels[source] || source || "功能仓库";
    }

    function createElement(tagName, className, text) {
        const element = document.createElement(tagName);
        if (className) element.className = className;
        if (text != null) element.textContent = text;
        return element;
    }

    function createActionButton(label, className, handler) {
        const button = createElement("button", className, label);
        button.type = "button";
        button.addEventListener("click", handler);
        return button;
    }

    function supportedTypes(app) {
        const extensions = (app.fileHandlers || [])
            .flatMap((handler) => handler.extensions || []);
        return [...new Set(extensions)].join("、");
    }

    function openRemovalDialog(app) {
        pendingRemoval = app;
        const dialog = document.getElementById("functionRemoveDialog");
        const message = document.getElementById("functionRemoveMessage");
        if (message) {
            const types = supportedTypes(app);
            message.textContent = types
                ? `确定从当前使用者移除“${app.name}”吗？移除后将不再关联 ${types} 文件。`
                : `确定从当前使用者移除“${app.name}”吗？`;
        }
        if (typeof dialog?.showModal === "function") {
            dialog.showModal();
            return;
        }
        if (window.confirm(message?.textContent || `移除 ${app.name}？`)) {
            removePendingFunction();
        }
    }

    async function removePendingFunction() {
        if (!pendingRemoval) return;
        const app = pendingRemoval;
        pendingRemoval = null;
        try {
            setManagerStatus(`正在移除 ${app.name} 的使用关联……`);
            await registryApi().uninstall(app.id, { retainData: true });
            await renderFunctionManager();
            setManagerStatus(`${app.name} 已从当前使用者移除，程序文件和个人数据均已保留。`);
        } catch (error) {
            setManagerStatus(error.message || "功能移除失败。", true);
        }
    }

    async function createFunctionCard(app, association) {
        const card = createElement("article", "function-manager-card");
        card.dataset.functionId = app.id;

        const icon = document.createElement("img");
        icon.src = app.icon;
        icon.alt = "";
        card.appendChild(icon);

        const information = createElement("div", "function-card-information");
        information.appendChild(createElement("h5", "function-card-title", app.name));

        const metadata = createElement("div", "function-card-meta");
        const system = association.state === "system";
        metadata.appendChild(createElement(
            "span",
            "",
            system ? "系统组件" : (association.installed ? "已添加" : "可添加")
        ));
        metadata.appendChild(createElement("span", "", sourceLabel(association.source)));
        const types = supportedTypes(app);
        if (types) metadata.appendChild(createElement("span", "", types));
        information.appendChild(metadata);
        card.appendChild(information);

        const actions = createElement("div", "function-card-actions");
        if (association.installed) {
            actions.appendChild(createActionButton("打开", "", async () => {
                try {
                    await registryApi().launch(app.id);
                } catch (error) {
                    setManagerStatus(error.message || "功能启动失败。", true);
                }
            }));
        }

        if (!system && association.installed) {
            const desktopToggle = createElement("label", "function-desktop-toggle");
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.checked = association.desktopVisible;
            checkbox.addEventListener("change", async () => {
                checkbox.disabled = true;
                try {
                    await registryApi().setDesktopVisible(app.id, checkbox.checked);
                    setManagerStatus(
                        checkbox.checked
                            ? `${app.name} 已显示在桌面。`
                            : `${app.name} 已从桌面隐藏。`
                    );
                } catch (error) {
                    checkbox.checked = !checkbox.checked;
                    setManagerStatus(error.message || "桌面显示状态修改失败。", true);
                } finally {
                    checkbox.disabled = false;
                }
            });
            desktopToggle.appendChild(checkbox);
            desktopToggle.appendChild(document.createTextNode("桌面显示"));
            actions.appendChild(desktopToggle);
            actions.appendChild(createActionButton("移除", "danger", () => {
                openRemovalDialog(app);
            }));
        } else if (!system) {
            actions.appendChild(createActionButton("添加", "primary", async () => {
                try {
                    setManagerStatus(`正在添加 ${app.name}……`);
                    await registryApi().install(app.id, { source: "repository" });
                    await renderFunctionManager();
                    setManagerStatus(`${app.name} 已关联到当前使用者。`);
                } catch (error) {
                    setManagerStatus(error.message || "功能添加失败。", true);
                }
            }));
        }

        card.appendChild(actions);
        return card;
    }

    function updateSummary(records) {
        const element = document.getElementById("functionSummary");
        if (!element) return;
        const systemCount = records.filter((item) => item.association.state === "system").length;
        const installedCount = records.filter((item) =>
            item.association.state !== "system" && item.association.installed
        ).length;
        const availableCount = records.filter((item) =>
            item.association.state !== "system" && !item.association.installed
        ).length;
        element.replaceChildren(
            createElement("span", "function-summary-chip", `我的功能 ${installedCount}`),
            createElement("span", "function-summary-chip", `可添加 ${availableCount}`),
            createElement("span", "function-summary-chip", `系统功能 ${systemCount}`)
        );
    }

    async function renderFunctionManager() {
        const api = registryApi();
        const list = document.getElementById("functionManagerList");
        if (!api || !list) {
            setManagerStatus("功能注册服务不可用。", true);
            return;
        }

        setManagerStatus("正在读取当前使用者的功能关联……");
        await api.ready();
        const catalog = (await api.listCatalog())
            .filter((app) => app.placement?.allFunctions !== false);
        const records = await Promise.all(catalog.map(async (app) => ({
            app,
            association: await api.getInstallation(app)
        })));

        updateScopeBadge();
        updateSummary(records);

        const search = (document.getElementById("functionSearch")?.value || "")
            .trim()
            .toLowerCase();
        const filter = document.getElementById("functionFilter")?.value || "all";
        const filtered = records.filter(({ app, association }) => {
            if (search && !`${app.name} ${app.id}`.toLowerCase().includes(search)) return false;
            if (filter === "system") return association.state === "system";
            if (filter === "installed") {
                return association.state !== "system" && association.installed;
            }
            if (filter === "available") {
                return association.state !== "system" && !association.installed;
            }
            return true;
        });

        const groups = [
            {
                title: "我的功能",
                items: filtered.filter((item) =>
                    item.association.state !== "system" && item.association.installed
                )
            },
            {
                title: "可添加功能",
                items: filtered.filter((item) =>
                    item.association.state !== "system" && !item.association.installed
                )
            },
            {
                title: "系统功能",
                items: filtered.filter((item) => item.association.state === "system")
            }
        ];

        list.replaceChildren();
        for (const groupDefinition of groups) {
            if (!groupDefinition.items.length) continue;
            const group = createElement("section", "function-manager-group");
            group.appendChild(createElement("h4", "", groupDefinition.title));
            for (const record of groupDefinition.items) {
                group.appendChild(await createFunctionCard(record.app, record.association));
            }
            list.appendChild(group);
        }

        if (!list.children.length) {
            list.appendChild(createElement("div", "function-empty-state", "没有符合条件的功能。"));
        }
        setManagerStatus("");
    }

    document.addEventListener("DOMContentLoaded", () => {
        const search = document.getElementById("functionSearch");
        const filter = document.getElementById("functionFilter");
        const dialog = document.getElementById("functionRemoveDialog");

        search?.addEventListener("input", () => {
            renderFunctionManager().catch((error) => {
                setManagerStatus(error.message || "功能列表刷新失败。", true);
            });
        });
        filter?.addEventListener("change", () => {
            renderFunctionManager().catch((error) => {
                setManagerStatus(error.message || "功能列表刷新失败。", true);
            });
        });
        dialog?.addEventListener("close", () => {
            if (dialog.returnValue === "confirm") {
                removePendingFunction();
            } else {
                pendingRemoval = null;
            }
            dialog.returnValue = "";
        });

        renderFunctionManager().catch((error) => {
            setManagerStatus(error.message || "功能管理初始化失败。", true);
        });

        try {
            const host = getDesktopHost();
            if (host !== window) {
                host.addEventListener("webwindows:login", renderFunctionManager);
                host.addEventListener("webwindows:logout", renderFunctionManager);
                host.addEventListener("webwindows:function-sync-state", (event) => {
                    updateScopeBadge();
                    if (event.detail?.status === "error" ||
                        event.detail?.status === "offline") {
                        setManagerStatus(event.detail.message, event.detail.status === "error");
                    }
                });
            }
        } catch (_) {
            // 设置页仍可在独立窗口中使用其余设置功能。
        }
    });
})();
