
// WebWindows language layer.  Pages start in simplified Chinese and translate
// their visible interface at runtime, which keeps existing window markup intact.
const languageCatalog = {
  tw: {
    "设置": "設定", "语言与区域": "語言與地區", "桌面壁纸": "桌面桌布", "显示设置": "顯示設定",
    "网络与连接": "網路與連線", "简体中文": "簡體中文", "繁體中文": "繁體中文", "网站建设": "網站建置",
    "云服务": "雲端服務", "云秘书": "雲端秘書", "软件开发": "軟體開發", "对日外包": "對日委外",
    "新闻中心": "新聞中心", "联系我们": "聯絡我們", "开始": "開始", "刷新": "重新整理",
    "关闭": "關閉", "最大化": "最大化", "最小化": "最小化", "邮件": "郵件", "认识我": "認識我", "问道": "問道"
  },
  en: {
    "设置": "Settings", "语言与区域": "Language & Region", "桌面壁纸": "Desktop Wallpaper", "显示设置": "Display",
    "网络与连接": "Network & Connectivity", "简体中文": "Simplified Chinese", "繁體中文": "Traditional Chinese", "网站建设": "Web Development",
    "云服务": "Cloud Services", "云秘书": "Cloud Assistant", "软件开发": "Software Development", "对日外包": "Japan Outsourcing",
    "新闻中心": "News", "联系我们": "Contact Us", "开始": "Start", "刷新": "Refresh", "关闭": "Close",
    "最大化": "Maximize", "最小化": "Minimize", "邮件": "Mail", "认识我": "About WebWindows", "问道": "Wendao",
    "显示语言": "Display Language", "地区设置": "Region", "界面缩放": "Interface Scale", "当前分辨率": "Resolution",
    "网络已连接": "Network connected", "网络已断开": "Network disconnected", "接入类型": "Connection type",
    "网络质量": "Network quality", "往返延迟": "Round-trip latency", "节省流量": "Data saver"
  },
  jp: {
    "设置": "設定", "语言与区域": "言語と地域", "桌面壁纸": "デスクトップの壁紙", "显示设置": "表示設定",
    "网络与连接": "ネットワークと接続", "简体中文": "簡体中国語", "繁體中文": "繁体中国語", "网站建设": "Web 開発",
    "云服务": "クラウドサービス", "云秘书": "クラウド秘書", "软件开发": "ソフトウェア開発", "对日外包": "日本向けアウトソーシング",
    "新闻中心": "ニュース", "联系我们": "お問い合わせ", "开始": "開始", "刷新": "更新", "关闭": "閉じる",
    "最大化": "最大化", "最小化": "最小化", "邮件": "メール", "认识我": "WebWindows について", "问道": "問道",
    "显示语言": "表示言語", "地区设置": "地域", "界面缩放": "表示倍率", "当前分辨率": "解像度",
    "网络已连接": "ネットワーク接続済み", "网络已断开": "ネットワーク切断",
    "接入类型": "接続種類", "网络质量": "ネットワーク品質", "往返延迟": "往復遅延", "节省流量": "データセーバー"
  }
};

// 共通桌面、设置、云资料与编辑器词汇。动态创建的窗口也通过同一目录翻译，
// 避免各功能分别维护语言状态而出现一半中文、一半目标语言。
Object.assign(languageCatalog.en, {
  "功能管理": "Features", "使用向导": "User Guide", "中国大陆（北京时间）": "Mainland China (Beijing Time)",
  "日本（日本标准时间）": "Japan (Japan Standard Time)", "台湾（台北时间）": "Taiwan (Taipei Time)",
  "地区会同步更新任务栏时钟、日期和日历节假日区域。": "The region controls the taskbar clock, date, calendar, and holidays.",
  "正在检查网络…": "Checking network…", "接入方式": "Access type", "移动网络代际": "Mobile network generation",
  "连接质量": "Connection quality", "正在检测": "Detecting", "未检测到": "Not detected", "未知": "Unknown",
  "设备类型": "Device type", "本机使用者": "Current user", "全部": "All", "我的功能": "My features",
  "可添加功能": "Available features", "系统功能": "System features", "打开使用向导": "Open User Guide",
  "查找使用方法与问题解答": "Find instructions and troubleshooting", "移除功能": "Remove feature",
  "确认移除": "Confirm removal", "取消": "Cancel", "保存": "Save", "登录": "Sign in", "注销": "Sign out",
  "未登录": "Not signed in", "线下用户": "Offline user", "使用者": "User", "锁定": "Lock", "重新启动": "Restart",
  "云资料": "Cloud Files", "功能中心": "Feature Center", "系统信息": "System Information", "讯筒": "DeskTalk",
  "推荐": "Discover", "好友": "Friends", "小讯": "Messages", "讯筒管理": "DeskTalk Center",
  "打开邮筒": "Open mailbox", "邮送记录": "Sent mail", "写信": "Compose", "讯址设置": "Address settings",
  "废纸篓": "Trash", "发送": "Send", "返回列表": "Back to list", "只看在线": "Online only",
  "加好友": "Add friend", "离线": "Offline", "设置你的昵称": "Set your nickname", "换颜色": "Change color",
  "认识我 · WebWindows": "About WebWindows", "我是谁": "Who I am", "我能做什么": "What I can do",
  "云桌面": "Cloud Desktop", "理念": "Vision", "我们公司": "Our company", "继续了解": "Learn more",
  "多窗口系统": "Multi-window system", "云端同步": "Cloud sync", "声音": "Sound",
  "文件": "File", "从云资料打开": "Open from Cloud Files", "另存到云资料": "Save As to Cloud Files",
  "另存 XLSX 到云资料": "Save XLSX to Cloud Files", "另存 DOCX 到云资料": "Save DOCX to Cloud Files",
  "保存副本到云资料": "Save a copy to Cloud Files", "保存原文件副本到云资料": "Save original copy to Cloud Files",
  "撤销": "Undo", "重做": "Redo", "只读": "Read-only", "编辑": "Edit", "阅读": "Read",
  "打印": "Print", "就绪": "Ready", "新建空白文档": "New blank document", "新工作表": "New worksheet",
  "上一页": "Previous", "下一页": "Next", "全屏放映": "Full-screen slideshow", "只读预览": "Read-only preview",
  "正在打开文档…": "Opening document…", "正在解析演示文稿…": "Parsing presentation…", "编辑模式": "Edit mode",
  "兼容预览模式": "Compatibility preview", "缩放": "Restore", "已打开的窗口": "Open windows"
});
Object.assign(languageCatalog.en, {
  "DeskTalk 面板（打开/收起）": "DeskTalk panel (open/collapse)", "声音大小控制": "Volume control",
  "点击修改昵称": "Click to change nickname", "不打扰（仅徽标）": "Do not disturb (badges only)", "不打扰": "Do not disturb",
  "面板导航": "Panel navigation", "收件：": "Inbox:", "已发送：": "Sent:", "废纸篓：": "Trash:", "封": "messages",
  "邮件保存在本机浏览器中。云端邮送会在同步服务接入后启用。": "Mail is stored in this browser. Cloud delivery will be enabled when the sync service is connected.",
  "搜索 WebWindows 用户…": "Search WebWindows users…", "定位中...": "Locating…", "天气图标": "Weather icon", "快晴": "Clear",
  "你好，我是 WebWindows": "Hello, I am WebWindows", "立志成为中国第一个真正的桌面操作系统": "Built to become China's first true desktop operating system",
  "成都亚原软件有限公司 出品": "By Chengdu Aryan Software Co., Ltd.", "这是 WebWindows 的核心能力": "This is a core WebWindows capability",
  "你可以与系统交互、获取信息，甚至作为助手使用": "Interact with the system, get information, and use it as an assistant",
  "你的桌面不会消失": "Your desktop stays with you", "所有状态都会被保存": "Your state is preserved",
  "你可以在任何设备继续使用": "Continue on any device"
});
Object.assign(languageCatalog.en, {
  "DeskTalk 侧面板": "DeskTalk side panel", "访客-": "Guest-", "加载中...": "Loading...", "休眠": "Sleep",
  "全部功能": "All features", "电源": "Power", "自动排列图标": "Auto arrange icons", "个性化": "Personalize",
  "邮筒内容": "Mailbox", "WebWindows 桌讯": "WebWindows DeskTalk", "欢迎使用讯筒": "Welcome to DeskTalk",
  "还没有邮送记录。": "No sent mail yet.", "废纸篓是空的。": "Trash is empty.", "QQ 邮箱": "QQ Mail",
  "添加讯址": "Add address", "讯址中心": "Address Center", "有什么想对我说：": "Message:",
  "关闭推荐列表": "Close recommendations", "不被推荐（隐藏我的账号）": "Do not recommend me (hide my account)",
  "管理用于收发邮件的讯址。连接凭据将由讯址中心安全保存，不会保存在浏览器中。": "Manage addresses used to send and receive mail. Credentials are stored securely by Address Center, not in the browser.",
  "尚未添加讯址。添加后可设为默认发件讯址。": "No address has been added. You can set one as the default sender after adding it.",
  "讯址中心尚未部署或不可访问；请先完成 MailKit 部署。": "Address Center is unavailable. Complete the MailKit deployment first.",
  "可在“设置”里随时修改；是否被推荐由“隐私偏好”决定。": "Change this anytime in Settings; recommendations follow your privacy preference.",
  "像电脑一样打开和管理多个窗口": "Open and manage multiple windows like a computer",
  "自动保存状态，换设备继续使用": "Save state automatically and continue on another device",
  "内置交互与信息辅助能力": "Built-in interaction and information assistance",
  "WebWindows 的出发点，并不是做一个普通的网页应用": "WebWindows was not created as an ordinary web app",
  "在不同设备、不同系统之间，软件始终是割裂的": "Software remains fragmented across devices and operating systems",
  "但 Web，是少数可以跨越一切设备的共同标准": "The Web is one of the few standards shared by every device",
  "无论硬件如何变化": "No matter how hardware changes", "无论系统如何演进": "No matter how systems evolve",
  "浏览器始终存在": "The browser remains", "WebWindows 正是基于这一点诞生的": "WebWindows was born from this idea",
  "它尝试把“桌面”带到 Web 上": "It brings the desktop to the Web",
  "让任何设备，都可以拥有统一的使用环境": "It gives every device a consistent environment",
  "同时，我们也希望在既有标准之外": "We also look beyond existing conventions",
  "探索一种属于自己的系统形态": "to explore a system form of our own",
  "这不是一个工具，而是一种新的操作方式": "This is not merely a tool, but a new way of working",
  "WebWindows 由成都亚原软件有限公司持续开发。": "WebWindows is continuously developed by Chengdu Aryan Software Co., Ltd.",
  "我们关注 Web 应用、云端工作空间与跨设备使用体验。": "We focus on web apps, cloud workspaces, and cross-device experiences."
});
Object.assign(languageCatalog.en, {
  "家庭宽带直连（有线）": "Direct home broadband (Ethernet)", "Wi‑Fi 无线网络": "Wi‑Fi",
  "手机移动网络": "Mobile network", "未连接网络": "No network", "接入方式未识别": "Access type not identified",
  "不可用": "Unavailable", "很慢": "Very slow", "较慢": "Slow", "一般": "Average", "良好": "Good", "约": "about",
  "移动数据（代际未知）": "Mobile data (generation unknown)", "手机或平板": "Phone or tablet", "电脑": "Computer",
  "开启": "On", "请检查设备或浏览器的网络连接。": "Check the device or browser network connection.",
  "已联网，但当前浏览器没有返回直连、Wi‑Fi 或移动网络类型。": "Online, but the browser did not report Ethernet, Wi‑Fi, or mobile network type."
});

Object.assign(languageCatalog.jp, {
  "功能管理": "機能管理", "使用向导": "利用ガイド", "中国大陆（北京时间）": "中国本土（北京時間）",
  "日本（日本标准时间）": "日本（日本標準時）", "台湾（台北时间）": "台湾（台北時間）",
  "地区会同步更新任务栏时钟、日期和日历节假日区域。": "地域はタスクバーの時刻、日付、カレンダー、祝日に反映されます。",
  "正在检查网络…": "ネットワークを確認中…", "接入方式": "接続方式", "移动网络代际": "モバイル通信世代",
  "连接质量": "接続品質", "正在检测": "検出中", "未检测到": "未検出", "未知": "不明",
  "设备类型": "デバイス種類", "本机使用者": "現在のユーザー", "全部": "すべて", "我的功能": "マイ機能",
  "可添加功能": "追加可能な機能", "系统功能": "システム機能", "打开使用向导": "利用ガイドを開く",
  "查找使用方法与问题解答": "使い方とトラブル解決を確認", "移除功能": "機能を削除",
  "确认移除": "削除を確認", "取消": "キャンセル", "保存": "保存する", "登录": "ログイン", "注销": "ログアウト",
  "未登录": "未ログイン", "线下用户": "オフラインユーザー", "使用者": "ユーザー", "锁定": "ロック", "重新启动": "再起動",
  "云资料": "クラウド資料", "功能中心": "機能センター", "系统信息": "システム情報", "讯筒": "DeskTalk",
  "推荐": "おすすめ", "好友": "友達", "小讯": "メッセージ", "讯筒管理": "DeskTalk 管理",
  "打开邮筒": "メールボックスを開く", "邮送记录": "送信履歴", "写信": "メール作成", "讯址设置": "アドレス設定",
  "废纸篓": "ごみ箱", "发送": "送信", "返回列表": "一覧へ戻る", "只看在线": "オンラインのみ",
  "加好友": "友達を追加", "离线": "オフライン", "设置你的昵称": "ニックネームを設定", "换颜色": "色を変更",
  "认识我 · WebWindows": "WebWindows について", "我是谁": "私について", "我能做什么": "できること",
  "云桌面": "クラウドデスクトップ", "理念": "理念", "我们公司": "会社情報", "继续了解": "詳しく見る",
  "多窗口系统": "マルチウィンドウ", "云端同步": "クラウド同期", "声音": "サウンド",
  "文件": "ファイル", "从云资料打开": "クラウド資料から開く", "另存到云资料": "クラウド資料に名前を付けて保存",
  "另存 XLSX 到云资料": "XLSX をクラウド資料に保存", "另存 DOCX 到云资料": "DOCX をクラウド資料に保存",
  "保存副本到云资料": "コピーをクラウド資料に保存", "保存原文件副本到云资料": "元ファイルのコピーをクラウド資料に保存",
  "撤销": "元に戻す", "重做": "やり直す", "只读": "読み取り専用", "编辑": "編集", "阅读": "閲覧",
  "打印": "印刷", "就绪": "準備完了", "新建空白文档": "空白文書を新規作成", "新工作表": "新しいワークシート",
  "上一页": "前へ", "下一页": "次へ", "全屏放映": "全画面スライドショー", "只读预览": "読み取り専用プレビュー",
  "正在打开文档…": "文書を開いています…", "正在解析演示文稿…": "プレゼンテーションを解析中…", "编辑模式": "編集モード",
  "兼容预览模式": "互換プレビューモード", "缩放": "元のサイズ", "已打开的窗口": "開いているウィンドウ"
});
Object.assign(languageCatalog.jp, {
  "DeskTalk 面板（打开/收起）": "DeskTalk パネル（開く／閉じる）", "声音大小控制": "音量調整",
  "点击修改昵称": "クリックしてニックネームを変更", "不打扰（仅徽标）": "通知を抑制（バッジのみ）", "不打扰": "通知を抑制",
  "面板导航": "パネルナビゲーション", "收件：": "受信：", "已发送：": "送信済み：", "废纸篓：": "ごみ箱：", "封": "件",
  "邮件保存在本机浏览器中。云端邮送会在同步服务接入后启用。": "メールはこのブラウザーに保存されます。同期サービス接続後にクラウド送信が有効になります。",
  "搜索 WebWindows 用户…": "WebWindows ユーザーを検索…", "定位中...": "位置情報を取得中...", "天气图标": "天気アイコン", "快晴": "快晴",
  "你好，我是 WebWindows": "こんにちは、WebWindows です", "立志成为中国第一个真正的桌面操作系统": "中国初の真のデスクトップ OS を目指しています",
  "成都亚原软件有限公司 出品": "成都亜原ソフトウェア有限公司", "这是 WebWindows 的核心能力": "WebWindows の中核機能です",
  "你可以与系统交互、获取信息，甚至作为助手使用": "システムと対話し、情報取得やアシスタントとして利用できます",
  "你的桌面不会消失": "デスクトップは失われません", "所有状态都会被保存": "すべての状態が保存されます",
  "你可以在任何设备继续使用": "どのデバイスからでも続けられます"
});
Object.assign(languageCatalog.jp, {
  "DeskTalk 侧面板": "DeskTalk サイドパネル", "访客-": "ゲスト-", "加载中...": "読み込み中...", "休眠": "スリープ",
  "全部功能": "すべての機能", "电源": "電源", "自动排列图标": "アイコンの自動整列", "个性化": "個人設定",
  "邮筒内容": "メールボックス", "WebWindows 桌讯": "WebWindows DeskTalk", "欢迎使用讯筒": "DeskTalk へようこそ",
  "还没有邮送记录。": "送信履歴はありません。", "废纸篓是空的。": "ごみ箱は空です。", "QQ 邮箱": "QQ メール",
  "添加讯址": "アドレスを追加", "讯址中心": "アドレスセンター", "有什么想对我说：": "メッセージ：",
  "关闭推荐列表": "おすすめ一覧を閉じる", "不被推荐（隐藏我的账号）": "おすすめに表示しない（アカウントを非表示）",
  "管理用于收发邮件的讯址。连接凭据将由讯址中心安全保存，不会保存在浏览器中。": "メール送受信用アドレスを管理します。認証情報はブラウザーではなくアドレスセンターに安全に保存されます。",
  "尚未添加讯址。添加后可设为默认发件讯址。": "アドレスは未登録です。追加後、既定の送信元に設定できます。",
  "讯址中心尚未部署或不可访问；请先完成 MailKit 部署。": "アドレスセンターを利用できません。先に MailKit を配置してください。",
  "可在“设置”里随时修改；是否被推荐由“隐私偏好”决定。": "設定からいつでも変更できます。おすすめ表示はプライバシー設定に従います。",
  "像电脑一样打开和管理多个窗口": "パソコンのように複数ウィンドウを開いて管理",
  "自动保存状态，换设备继续使用": "状態を自動保存し、別のデバイスで継続",
  "内置交互与信息辅助能力": "対話と情報支援機能を内蔵",
  "WebWindows 的出发点，并不是做一个普通的网页应用": "WebWindows は一般的な Web アプリを目指したものではありません",
  "在不同设备、不同系统之间，软件始终是割裂的": "ソフトウェアはデバイスや OS ごとに分断されています",
  "但 Web，是少数可以跨越一切设备的共同标准": "Web はあらゆるデバイスを横断できる数少ない共通規格です",
  "无论硬件如何变化": "ハードウェアが変わっても", "无论系统如何演进": "システムが進化しても",
  "浏览器始终存在": "ブラウザーは存在し続けます", "WebWindows 正是基于这一点诞生的": "WebWindows はこの考えから生まれました",
  "它尝试把“桌面”带到 Web 上": "デスクトップを Web に持ち込み",
  "让任何设备，都可以拥有统一的使用环境": "どのデバイスにも統一された利用環境を提供します",
  "同时，我们也希望在既有标准之外": "既存の枠組みを超えて",
  "探索一种属于自己的系统形态": "独自のシステム形態を探求します",
  "这不是一个工具，而是一种新的操作方式": "単なるツールではなく、新しい操作方法です",
  "WebWindows 由成都亚原软件有限公司持续开发。": "WebWindows は成都亜原ソフトウェア有限公司が継続開発しています。",
  "我们关注 Web 应用、云端工作空间与跨设备使用体验。": "Web アプリ、クラウドワークスペース、クロスデバイス体験に取り組んでいます。"
});
Object.assign(languageCatalog.jp, {
  "家庭宽带直连（有线）": "家庭用ブロードバンド直結（有線）", "Wi‑Fi 无线网络": "Wi‑Fi",
  "手机移动网络": "モバイルネットワーク", "未连接网络": "ネットワーク未接続", "接入方式未识别": "接続方式を識別できません",
  "不可用": "利用不可", "很慢": "非常に遅い", "较慢": "遅い", "一般": "標準", "良好": "良好", "约": "約",
  "移动数据（代际未知）": "モバイルデータ（世代不明）", "手机或平板": "スマートフォンまたはタブレット", "电脑": "パソコン",
  "开启": "オン", "请检查设备或浏览器的网络连接。": "デバイスまたはブラウザーのネットワーク接続を確認してください。",
  "已联网，但当前浏览器没有返回直连、Wi‑Fi 或移动网络类型。": "接続済みですが、ブラウザーから有線、Wi‑Fi、モバイルの種類が返されていません。"
});

// 设备操作专题：保持菜单和会话遮罩为完整句翻译，避免长句被旧词条局部替换。
Object.assign(languageCatalog.tw, {
  "WebWindows 会话与设备操作": "WebWindows 工作階段與裝置操作",
  "锁定 WebWindows": "鎖定 WebWindows",
  "休眠 WebWindows 会话": "讓 WebWindows 工作階段休眠",
  "关闭 WebWindows 会话": "關閉 WebWindows 工作階段",
  "重新启动 WebWindows": "重新啟動 WebWindows",
  "WebWindows 会话已关闭": "WebWindows 工作階段已關閉",
  "宿主设备仍在运行。你可以随时返回当前 WebWindows 会话。": "主機裝置仍在運作。你可以隨時返回目前的 WebWindows 工作階段。",
  "返回 WebWindows": "返回 WebWindows",
  "WebWindows 会话已休眠": "WebWindows 工作階段已休眠",
  "这只会遮住当前 WebWindows 会话，不会让宿主设备进入睡眠。": "這只會遮住目前的 WebWindows 工作階段，不會讓主機裝置進入睡眠。",
  "唤醒 WebWindows": "喚醒 WebWindows",
  "WebWindows 已锁定": "WebWindows 已鎖定",
  "这是会话级隐私遮罩，并非宿主设备锁屏；继续时无需设备密码。": "這是工作階段層級的隱私遮罩，並非主機裝置鎖定畫面；繼續時不需要裝置密碼。",
  "继续使用": "繼續使用",
  "关闭设备": "關閉裝置",
  "重新启动设备": "重新啟動裝置",
  "设备休眠": "裝置休眠",
  "锁定设备": "鎖定裝置"
});

Object.assign(languageCatalog.en, {
  "WebWindows 会话与设备操作": "WebWindows session and device operations",
  "锁定 WebWindows": "Lock WebWindows",
  "休眠 WebWindows 会话": "Sleep WebWindows session",
  "关闭 WebWindows 会话": "Close WebWindows session",
  "重新启动 WebWindows": "Restart WebWindows",
  "WebWindows 会话已关闭": "WebWindows session closed",
  "宿主设备仍在运行。你可以随时返回当前 WebWindows 会话。": "The host device is still running. You can return to this WebWindows session at any time.",
  "返回 WebWindows": "Return to WebWindows",
  "WebWindows 会话已休眠": "WebWindows session sleeping",
  "这只会遮住当前 WebWindows 会话，不会让宿主设备进入睡眠。": "This only hides the current WebWindows session. It does not put the host device to sleep.",
  "唤醒 WebWindows": "Wake WebWindows",
  "WebWindows 已锁定": "WebWindows locked",
  "这是会话级隐私遮罩，并非宿主设备锁屏；继续时无需设备密码。": "This is a session privacy cover, not the host device lock screen. No device password is required to continue.",
  "继续使用": "Continue",
  "关闭设备": "Shut down device",
  "重新启动设备": "Restart device",
  "设备休眠": "Sleep device",
  "锁定设备": "Lock device"
});

Object.assign(languageCatalog.jp, {
  "WebWindows 会话与设备操作": "WebWindows セッションとデバイス操作",
  "锁定 WebWindows": "WebWindows をロック",
  "休眠 WebWindows 会话": "WebWindows セッションをスリープ",
  "关闭 WebWindows 会话": "WebWindows セッションを閉じる",
  "重新启动 WebWindows": "WebWindows を再起動",
  "WebWindows 会话已关闭": "WebWindows セッションを閉じました",
  "宿主设备仍在运行。你可以随时返回当前 WebWindows 会话。": "ホストデバイスは動作中です。いつでも現在の WebWindows セッションに戻れます。",
  "返回 WebWindows": "WebWindows に戻る",
  "WebWindows 会话已休眠": "WebWindows セッションはスリープ中です",
  "这只会遮住当前 WebWindows 会话，不会让宿主设备进入睡眠。": "現在の WebWindows セッションを隠すだけで、ホストデバイスはスリープしません。",
  "唤醒 WebWindows": "WebWindows を再開",
  "WebWindows 已锁定": "WebWindows はロックされています",
  "这是会话级隐私遮罩，并非宿主设备锁屏；继续时无需设备密码。": "これはセッション用のプライバシー画面であり、ホストデバイスのロック画面ではありません。続行にデバイスのパスワードは不要です。",
  "继续使用": "使用を続ける",
  "关闭设备": "デバイスをシャットダウン",
  "重新启动设备": "デバイスを再起動",
  "设备休眠": "デバイスをスリープ",
  "锁定设备": "デバイスをロック"
});

// 设备体验专题：状态文本由脚本动态生成，仍统一走同一语言目录。
Object.assign(languageCatalog.tw, {
  "电池状态": "電池狀態", "电池已断开": "電池已斷開", "电量未知": "電量未知",
  "正在充电": "正在充電", "使用电池": "使用電池", "任务视图": "工作檢視", "窗口": "視窗",
  "窗口内容暂不可用。": "暫時無法取得視窗內容。",
  "跨域窗口内容受浏览器保护，无法生成内容缩略。": "跨來源視窗內容受瀏覽器保護，無法產生內容預覽。",
  "窗口已打开，暂无可读取的文字内容。": "視窗已開啟，目前沒有可讀取的文字內容。",
  "窗口已打开，请打开窗口查看内容。": "視窗已開啟，請開啟視窗查看內容。",
  "WebWindows 页面音量": "WebWindows 頁面音量", "亮度": "亮度",
  "调节 WebWindows 页面中的音视频音量，不代表系统硬件音量。": "調整 WebWindows 頁面中的影音音量，不代表系統硬體音量。",
  "调节 WebWindows 页面中的同源音视频音量，不代表系统硬件音量；跨域内容可能不受控制。": "調整 WebWindows 頁面中的同來源影音音量，不代表系統硬體音量；跨來源內容可能無法控制。",
  "由受信任外壳调节设备媒体音量；WebWindows 页面音视频也会同步。": "由受信任外殼調整裝置媒體音量；WebWindows 頁面影音也會同步。",
  "调节 WebWindows 页面视觉亮度，不代表屏幕背光。": "調整 WebWindows 頁面視覺亮度，不代表螢幕背光。",
  "由受信任外壳调节设备屏幕亮度。": "由受信任外殼調整裝置螢幕亮度。",
  "下载速度测试": "下載速度測試", "开始测速": "開始測速", "尚未开始": "尚未開始",
  "仅在你点击开始后下载测试数据，单次最多约 2 MB。移动网络可能产生流量费用。": "只有在你點擊開始後才下載測試資料，每次最多約 2 MB。行動網路可能產生流量費用。",
  "当前离线，无法开始测速。": "目前離線，無法開始測速。",
  "测试中：正在下载最多约 2 MB 测试数据……": "測試中：正在下載最多約 2 MB 的測試資料……",
  "完成：下载": "完成：下載", " MB，用时 ": " MB，用時 ", "用时": "用時", "秒。结果仅代表当前设备到 WebWindows 站点的下载速度。": "秒。結果只代表目前裝置到 WebWindows 網站的下載速度。",
  "测速已取消，已停止继续下载。": "測速已取消，已停止繼續下載。", "测速失败：": "測速失敗：", "网络请求失败": "網路請求失敗"
});

Object.assign(languageCatalog.tw, {
  "功能管理": "功能管理", "使用向导": "使用指南", "中国大陆（北京时间）": "中國大陸（北京時間）",
  "日本（日本标准时间）": "日本（日本標準時間）", "台湾（台北时间）": "台灣（台北時間）",
  "地区会同步更新任务栏时钟、日期和日历节假日区域。": "地區會同步更新工作列時鐘、日期和行事曆節假日區域。",
  "显示语言": "顯示語言", "地区设置": "地區設定", "界面缩放": "介面縮放", "当前分辨率": "目前解析度", "设备像素比": "裝置像素比",
  "用户名": "使用者名稱", "密码": "密碼", "登录": "登入", "注销": "登出", "未登录": "未登入",
  "本机使用者": "本機使用者", "线下用户": "離線使用者", "使用者": "使用者", "取消": "取消操作", "保存": "儲存",
  "云资料": "雲端資料", "功能中心": "功能中心", "开发者中心": "開發者中心", "系统信息": "系統資訊",
  "从云资料打开": "從雲端資料開啟", "另存到云资料": "另存到雲端資料", "正在保存": "正在儲存",
  "保存失败": "儲存失敗", "未保存": "尚未儲存", "关闭": "關閉", "最小化": "最小化", "最大化": "最大化",
  "我的功能": "我的功能", "可添加功能": "可新增功能", "系统功能": "系統功能", "全部功能": "所有功能",
  "添加": "新增", "移除": "移除", "确认移除": "確認移除", "打开": "開啟", "刷新": "重新整理",
  "正在检查网络…": "正在檢查網路…", "接入方式": "連線方式", "移动网络代际": "行動網路世代",
  "连接质量": "連線品質", "正在检测": "正在偵測", "未检测到": "未偵測到", "未知": "未知",
  "设备类型": "裝置類型", "网络已连接": "網路已連線", "网络已断开": "網路已斷線",
  "文件": "檔案", "撤销": "復原", "重做": "重做", "只读": "唯讀", "编辑": "編輯", "阅读": "閱讀",
  "打印": "列印", "就绪": "就緒", "新建空白文档": "新增空白文件", "新工作表": "新增工作表",
  "上一页": "上一頁", "下一页": "下一頁", "全屏放映": "全螢幕放映", "只读预览": "唯讀預覽",
  "正在打开文档…": "正在開啟文件…", "正在解析演示文稿…": "正在解析簡報…", "编辑模式": "編輯模式",
  "兼容预览模式": "相容預覽模式", "已打开的窗口": "已開啟的視窗", "系统组件": "系統元件",
  "同步中": "同步中", "已同步": "已同步", "离线待同步": "離線待同步", "等待重试": "等待重試", "仅本机": "僅本機"
});

Object.assign(languageCatalog.en, {
  "用户名": "Username", "密码": "Password", "开发者中心": "Developer Center", "设备像素比": "device pixel ratio",
  "正在保存": "Saving", "保存失败": "Save failed", "未保存": "Unsaved",
  "电池状态": "Battery status", "电池已断开": "Battery disconnected", "电量未知": "Battery level unknown",
  "正在充电": "Charging", "使用电池": "On battery", "任务视图": "Task view", "窗口": "Window",
  "窗口内容暂不可用。": "Window content is temporarily unavailable.",
  "跨域窗口内容受浏览器保护，无法生成内容缩略。": "Cross-origin window content is protected by the browser, so no content preview is available.",
  "窗口已打开，暂无可读取的文字内容。": "The window is open but has no readable text content.",
  "窗口已打开，请打开窗口查看内容。": "The window is open. Open it to view its content.",
  "WebWindows 页面音量": "WebWindows page volume", "亮度": "Brightness",
  "调节 WebWindows 页面中的音视频音量，不代表系统硬件音量。": "Adjusts audio and video in WebWindows pages, not system hardware volume.",
  "调节 WebWindows 页面中的同源音视频音量，不代表系统硬件音量；跨域内容可能不受控制。": "Adjusts same-origin audio and video in WebWindows pages, not system hardware volume. Cross-origin content may not be controllable.",
  "由受信任外壳调节设备媒体音量；WebWindows 页面音视频也会同步。": "A trusted shell adjusts device media volume; WebWindows page media is synchronized.",
  "调节 WebWindows 页面视觉亮度，不代表屏幕背光。": "Adjusts WebWindows visual brightness, not display backlight.",
  "由受信任外壳调节设备屏幕亮度。": "A trusted shell adjusts device screen brightness.",
  "下载速度测试": "Download speed test", "开始测速": "Start test", "尚未开始": "Not started",
  "仅在你点击开始后下载测试数据，单次最多约 2 MB。移动网络可能产生流量费用。": "Test data is downloaded only after you click Start, up to about 2 MB per test. Mobile data charges may apply.",
  "当前离线，无法开始测速。": "You are offline, so the speed test cannot start.",
  "测试中：正在下载最多约 2 MB 测试数据……": "Testing: downloading up to about 2 MB of test data…",
  "完成：下载": "Complete: downloaded", " MB，用时 ": " MB in ", "用时": "in", "秒。结果仅代表当前设备到 WebWindows 站点的下载速度。": "seconds. The result represents only this device's download speed from the WebWindows site.",
  "测速已取消，已停止继续下载。": "Speed test canceled. The download has stopped.", "测速失败：": "Speed test failed: ", "网络请求失败": "Network request failed"
});

Object.assign(languageCatalog.jp, {
  "用户名": "ユーザー名", "密码": "パスワード", "开发者中心": "開発者センター", "设备像素比": "デバイスピクセル比",
  "正在保存": "保存中", "保存失败": "保存に失敗しました", "未保存": "未保存",
  "电池状态": "バッテリー状態", "电池已断开": "バッテリーが切断されています", "电量未知": "バッテリー残量不明",
  "正在充电": "充電中", "使用电池": "バッテリー使用中", "任务视图": "タスクビュー", "窗口": "ウィンドウ",
  "窗口内容暂不可用。": "ウィンドウの内容は現在利用できません。",
  "跨域窗口内容受浏览器保护，无法生成内容缩略。": "別オリジンのウィンドウ内容はブラウザーで保護されているため、内容プレビューを生成できません。",
  "窗口已打开，暂无可读取的文字内容。": "ウィンドウは開いていますが、読み取れるテキストはありません。",
  "窗口已打开，请打开窗口查看内容。": "ウィンドウは開いています。内容を確認するにはウィンドウを開いてください。",
  "WebWindows 页面音量": "WebWindows ページ音量", "亮度": "明るさ",
  "调节 WebWindows 页面中的音视频音量，不代表系统硬件音量。": "WebWindows ページ内の音声と動画の音量を調整します。システムのハードウェア音量ではありません。",
  "调节 WebWindows 页面中的同源音视频音量，不代表系统硬件音量；跨域内容可能不受控制。": "WebWindows ページ内の同一オリジンの音声と動画を調整します。システム音量ではなく、別オリジンの内容は制御できない場合があります。",
  "由受信任外壳调节设备媒体音量；WebWindows 页面音视频也会同步。": "信頼済みシェルがデバイスのメディア音量を調整し、WebWindows ページ内の音声と動画も同期します。",
  "调节 WebWindows 页面视觉亮度，不代表屏幕背光。": "WebWindows ページの見た目の明るさを調整します。画面バックライトではありません。",
  "由受信任外壳调节设备屏幕亮度。": "信頼済みシェルがデバイス画面の明るさを調整します。",
  "下载速度测试": "ダウンロード速度テスト", "开始测速": "テスト開始", "尚未开始": "未開始",
  "仅在你点击开始后下载测试数据，单次最多约 2 MB。移动网络可能产生流量费用。": "開始をクリックした場合のみ、1 回最大約 2 MB のテストデータをダウンロードします。モバイル通信料が発生する場合があります。",
  "当前离线，无法开始测速。": "オフラインのため速度テストを開始できません。",
  "测试中：正在下载最多约 2 MB 测试数据……": "テスト中：最大約 2 MB のテストデータをダウンロードしています…",
  "完成：下载": "完了：ダウンロード", " MB，用时 ": " MB、所要時間 ", "用时": "所要時間", "秒。结果仅代表当前设备到 WebWindows 站点的下载速度。": "秒。この結果は現在のデバイスから WebWindows サイトまでのダウンロード速度のみを示します。",
  "测速已取消，已停止继续下载。": "速度テストをキャンセルし、ダウンロードを停止しました。", "测速失败：": "速度テスト失敗：", "网络请求失败": "ネットワーク要求に失敗しました"
});

Object.assign(languageCatalog.tw, {
  "电源管理": "電源管理", "当前电源": "目前電源", "交流电连接": "交流電連線", "电池": "電池",
  "电池电量": "電池電量", "充电状态": "充電狀態", "已连接": "已連線", "未连接": "未連線",
  "已安装": "已安裝", "无电池": "無電池", "未充电": "未充電", "交流电": "交流電",
  "电源来源与电池是否存在分别显示；当前数据由宿主或浏览器能力提供。": "電源來源與電池是否存在會分開顯示；目前資料由宿主或瀏覽器能力提供。",
  "当前浏览器或宿主不提供电源结构，相关项目明确显示为“未知”。": "目前瀏覽器或宿主未提供電源結構，相關項目會明確顯示為「未知」。"
});
Object.assign(languageCatalog.en, {
  "电源管理": "Power", "当前电源": "Power source", "交流电连接": "AC connection", "电池": "Battery",
  "电池电量": "Battery level", "充电状态": "Charging status", "已连接": "Connected", "未连接": "Disconnected",
  "已安装": "Present", "无电池": "No battery", "未充电": "Not charging", "交流电": "AC power",
  "电源来源与电池是否存在分别显示；当前数据由宿主或浏览器能力提供。": "Power source and battery presence are shown separately using host or browser data.",
  "当前浏览器或宿主不提供电源结构，相关项目明确显示为“未知”。": "This browser or host does not expose the power structure, so related values are shown as Unknown."
});
Object.assign(languageCatalog.jp, {
  "电源管理": "電源管理", "当前电源": "電源供給元", "交流电连接": "AC 電源接続", "电池": "バッテリー",
  "电池电量": "バッテリー残量", "充电状态": "充電状態", "已连接": "接続済み", "未连接": "未接続",
  "已安装": "搭載", "无电池": "バッテリーなし", "未充电": "充電していません", "交流电": "AC 電源",
  "电源来源与电池是否存在分别显示；当前数据由宿主或浏览器能力提供。": "電源供給元とバッテリーの有無を分けて表示し、ホストまたはブラウザーの情報を使用します。",
  "当前浏览器或宿主不提供电源结构，相关项目明确显示为“未知”。": "このブラウザーまたはホストでは電源構成を取得できないため、関連項目は「不明」と表示します。"
});

// WebWindows Developer Studio workbench. The Studio consumes the same shell
// language preference and translation service instead of maintaining a second
// locale store.
Object.assign(languageCatalog.en, {
  "新建功能": "New Function", "打开项目": "Open Project", "打开项目…": "Open Project…", "重命名": "Rename", "删除": "Delete",
  "验证": "Validate", "构建": "Build", "运行": "Run", "重新运行": "Reload", "停止": "Stop",
  "文件": "File", "编辑": "Edit", "视图": "View", "语言": "Language", "保存": "Save", "新建文件": "New File", "新建目录": "New Folder",
  "重命名所选项": "Rename Selection", "导出到云资料": "Export to Cloud Files", "验证项目": "Validate Project", "构建功能包": "Build Package",
  "运行预览": "Run Preview", "停止预览": "Stop Preview", "浅色主题": "Light Theme", "深色主题": "Dark Theme",
  "隐藏项目资源管理器": "Hide Explorer", "显示项目资源管理器": "Show Explorer", "隐藏底部面板": "Hide Bottom Panel", "显示底部面板": "Show Bottom Panel",
  "隐藏检查器": "Hide Inspector", "显示检查器": "Show Inspector", "WebWindows 专用开发环境": "WebWindows development environment",
  "项目": "Project", "选择文件开始编辑": "Select a file to start editing", "未选择文件": "No file selected", "检查器": "Inspector", "清单": "Manifest",
  "权限": "Permissions", "预览": "Preview", "验证结果": "Validation", "构建结果": "Build Result", "结果": "Result", "通过": "Passed", "阻止": "Blocked",
  "错误": "Errors", "警告": "Warnings", "文件数": "Files", "文件": "Files", "字节": "Bytes", "大小": "Size", "保存 ZIP 到云资料": "Save ZIP to Cloud Files",
  "权限检查器": "Permission Inspector", "开发者预览": "Developer Preview", "无活动会话": "No active session", "问题": "Problems", "控制台": "Console",
  "权限诊断": "Permission Diagnostics", "本地兼容存储": "Local fallback", "全部级别": "All levels", "清除": "Clear", "当前 Snapshot 未发现问题。": "No problems found in the current snapshot.",
  "当前开发者预览尚无控制台输出。": "The current Developer Preview has no console output.", "当前预览尚无 Broker 权限诊断。": "The current preview has no Broker permission diagnostics.",
  "表单": "Form", "名称": "Name", "版本": "Version", "描述": "Description", "分类": "Category", "入口": "Entry", "图标": "Icon", "窗口": "Window",
  "宽度": "Width", "高度": "Height", "单实例": "Singleton", "显示位置": "Placement", "开始菜单": "Start Menu", "全部功能": "All Functions", "桌面": "Desktop", "任务栏": "Taskbar",
  "请求的权限": "Requested Permissions", "风险": "Risk", "同意方式": "Consent", "已声明": "Declared", "策略": "Policy", "授权": "Grant", "运行时能力": "Runtime capability",
  "生效结果": "Effective", "策略版本": "Policy version", "未评估": "Not evaluated", "未指定": "Unspecified", "是": "Yes", "否": "No",
  "面板管理": "Panel management", "显示/隐藏项目资源管理器 (Ctrl+B)": "Show/hide Explorer (Ctrl+B)", "显示/隐藏底部面板 (Ctrl+J)": "Show/hide bottom panel (Ctrl+J)",
  "显示/隐藏检查器 (Ctrl+Alt+I)": "Show/hide Inspector (Ctrl+Alt+I)", "Developer Studio 菜单栏": "Developer Studio menu bar",
  "创建第一个 WebWindows 功能": "Create your first WebWindows Function", "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。": "Projects are stored in an isolated IndexedDB workspace and never written to installed apps or the production catalog.",
  "新建 Hello WebWindows": "Create Hello WebWindows", "当前 Snapshot 未发现问题。": "No problems found in the current snapshot.", "权限诊断": "Permission Diagnostics",
  "打开的文件": "Open files", "输入值": "Input value", "取消": "Cancel", "确认": "Confirm", "继续": "Continue"
  , "新建 WebWindows 功能": "New WebWindows Function", "项目名称": "Project name", "1（兼容隐式版本）": "1 (legacy implicit)",
  "单实例": "Singleton", "Manifest v1 不承载权限。升级到 v2 必须由开发者显式确认权限，Studio 不会从源码自动推断。": "Manifest v1 does not carry permissions. Migrating to v2 requires explicit developer confirmation; Studio never infers permissions from source code.",
  "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。": "catalog, package, and runtime are published-only fields and are not editable in the Source Manifest form. launch remains platform-reserved.",
  "个 Manifest 问题": " Manifest problems", "尚未创建 Snapshot 验证。": "No snapshot validation has been created.", "项目 UUID：": "Project UUID: ", "显示位置": "Placement", "单实例": "Singleton"
});
Object.assign(languageCatalog.tw, {
  "新建功能": "新增功能", "打开项目": "開啟專案", "打开项目…": "開啟專案…", "重命名": "重新命名", "删除": "刪除", "验证": "驗證", "构建": "建置", "运行": "執行",
  "文件": "檔案", "编辑": "編輯", "视图": "檢視", "语言": "語言", "保存": "儲存", "新建文件": "新增檔案", "新建目录": "新增資料夾", "导出到云资料": "匯出至雲端資料",
  "浅色主题": "淺色主題", "深色主题": "深色主題", "项目": "專案", "检查器": "檢查器", "清单": "資訊清單", "权限": "權限", "预览": "預覽", "问题": "問題", "控制台": "主控台",
  "构建结果": "建置結果", "验证结果": "驗證結果", "错误": "錯誤", "警告": "警告", "保存 ZIP 到云资料": "將 ZIP 儲存至雲端資料", "开发者预览": "開發者預覽",
  "表单": "表單", "名称": "名稱", "版本": "版本", "描述": "描述", "分类": "分類", "入口": "進入點", "图标": "圖示", "窗口": "視窗", "宽度": "寬度", "高度": "高度",
  "请求的权限": "要求的權限", "风险": "風險", "策略": "原則", "授权": "授權", "运行时能力": "執行階段能力",
  "面板管理": "面板管理", "显示/隐藏项目资源管理器 (Ctrl+B)": "顯示/隱藏專案總管 (Ctrl+B)", "显示/隐藏底部面板 (Ctrl+J)": "顯示/隱藏底部面板 (Ctrl+J)",
  "显示/隐藏检查器 (Ctrl+Alt+I)": "顯示/隱藏檢查器 (Ctrl+Alt+I)", "Developer Studio 菜单栏": "Developer Studio 選單列", "WebWindows 专用开发环境": "WebWindows 專用開發環境",
  "创建第一个 WebWindows 功能": "建立第一個 WebWindows 功能", "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。": "專案儲存在獨立的 IndexedDB 工作區，不會寫入正式安裝或功能目錄。",
  "新建 Hello WebWindows": "新增 Hello WebWindows", "当前 Snapshot 未发现问题。": "目前 Snapshot 未發現問題。", "权限诊断": "權限診斷"
  , "新建 WebWindows 功能": "新增 WebWindows 功能", "项目名称": "專案名稱", "1（兼容隐式版本）": "1（相容隱含版本）", "单实例": "單一執行個體",
  "显示位置": "顯示位置", "开始菜单": "開始選單", "全部功能": "所有功能", "桌面": "桌面", "任务栏": "工作列", "项目 UUID：": "專案 UUID：",
  "个 Manifest 问题": " 個 Manifest 問題", "尚未创建 Snapshot 验证。": "尚未建立 Snapshot 驗證。"
});
Object.assign(languageCatalog.jp, {
  "新建功能": "新規機能", "打开项目": "プロジェクトを開く", "打开项目…": "プロジェクトを開く…", "重命名": "名前を変更", "删除": "削除", "验证": "検証", "构建": "ビルド", "运行": "実行",
  "文件": "ファイル", "编辑": "編集", "视图": "表示", "语言": "言語", "保存": "保存", "新建文件": "新規ファイル", "新建目录": "新規フォルダー", "导出到云资料": "クラウド資料へ書き出す",
  "浅色主题": "ライトテーマ", "深色主题": "ダークテーマ", "项目": "プロジェクト", "检查器": "インスペクター", "清单": "マニフェスト", "权限": "権限", "预览": "プレビュー", "问题": "問題", "控制台": "コンソール",
  "构建结果": "ビルド結果", "验证结果": "検証結果", "错误": "エラー", "警告": "警告", "保存 ZIP 到云资料": "ZIP をクラウド資料に保存", "开发者预览": "開発者プレビュー",
  "表单": "フォーム", "名称": "名前", "版本": "バージョン", "描述": "説明", "分类": "カテゴリ", "入口": "エントリ", "图标": "アイコン", "窗口": "ウィンドウ", "宽度": "幅", "高度": "高さ",
  "请求的权限": "要求する権限", "风险": "リスク", "策略": "ポリシー", "授权": "許可", "运行时能力": "ランタイム能力",
  "面板管理": "パネル管理", "显示/隐藏项目资源管理器 (Ctrl+B)": "エクスプローラーを表示/非表示 (Ctrl+B)", "显示/隐藏底部面板 (Ctrl+J)": "下部パネルを表示/非表示 (Ctrl+J)",
  "显示/隐藏检查器 (Ctrl+Alt+I)": "インスペクターを表示/非表示 (Ctrl+Alt+I)", "Developer Studio 菜单栏": "Developer Studio メニューバー", "WebWindows 专用开发环境": "WebWindows 専用開発環境",
  "创建第一个 WebWindows 功能": "最初の WebWindows 機能を作成", "项目保存在独立 IndexedDB 工作区，不会写入正式安装或功能目录。": "プロジェクトは独立した IndexedDB ワークスペースに保存され、正式なインストール先や機能カタログには書き込まれません。",
  "新建 Hello WebWindows": "Hello WebWindows を作成", "当前 Snapshot 未发现问题。": "現在の Snapshot に問題はありません。", "权限诊断": "権限診断"
  , "新建 WebWindows 功能": "WebWindows 機能を新規作成", "项目名称": "プロジェクト名", "输入值": "入力値", "取消": "キャンセル", "确认": "確認", "继续": "続行",
  "1（兼容隐式版本）": "1（互換の暗黙バージョン）", "单实例": "シングルトン", "显示位置": "配置", "开始菜单": "スタートメニュー", "全部功能": "すべての機能", "桌面": "デスクトップ", "任务栏": "タスクバー",
  "项目 UUID：": "プロジェクト UUID：", "打开的文件": "開いているファイル", "个 Manifest 问题": " 件の Manifest 問題", "尚未创建 Snapshot 验证。": "Snapshot 検証はまだ作成されていません。",
  "Manifest v1 不承载权限。升级到 v2 必须由开发者显式确认权限，Studio 不会从源码自动推断。": "Manifest v1 は権限を保持しません。v2 への移行では開発者による明示的な確認が必要で、Studio がソースから権限を推測することはありません。",
  "catalog、package、runtime 为 published-only 字段，不在 Source Manifest 表单中开放。launch 保持平台保留。": "catalog、package、runtime は公開時のみのフィールドで、Source Manifest フォームでは編集できません。launch はプラットフォーム予約のままです。"
});

// 设置 → 应用（启动项）选项卡：静态文案与 settings.js 动态状态/控件文案。
// 缺键会导致其它语言下中英混排（半截替换），三语必须齐全。
Object.assign(languageCatalog.en, {
  "应用": "Apps",
  "管理 WebWindows 应用的桌面行为。启动项只保存当前使用者的配置，应用自身不能绕过启动管理修改该列表。": "Manage the desktop behavior of WebWindows apps. Startup entries only save the current user's configuration; apps cannot bypass startup management to modify this list.",
  "启动项": "Startup",
  "桌面会话就绪（session-ready）后，已启用的启动项会按设定延迟依次自动启动。关闭开关即停止该应用的自动启动。": "Once the desktop session is ready (session-ready), enabled startup items start automatically in sequence after their configured delay. Turn off the switch to stop that app from starting automatically.",
  "启动项服务尚未就绪，请重新打开设置。": "The startup service is not ready. Please reopen Settings.",
  "正在读取启动项……": "Loading startup items…",
  "启动项读取失败。": "Failed to load startup items.",
  "当前没有可配置的应用。": "There are no configurable apps right now.",
  "后台启动": "Start in background",
  "最小化启动": "Start minimized",
  "正常窗口": "Normal window",
  "启用": "Enabled",
  "毫秒": "ms",
  " 的启动项已保存。": " was saved as a startup item.",
  " 的启动项保存失败。": " could not be saved as a startup item.",
  " 启动模式": " startup mode",
  " 启动延迟（毫秒）": " startup delay (ms)"
});
Object.assign(languageCatalog.jp, {
  "应用": "アプリ",
  "管理 WebWindows 应用的桌面行为。启动项只保存当前使用者的配置，应用自身不能绕过启动管理修改该列表。": "WebWindows アプリのデスクトップ動作を管理します。起動項目は現在の利用者の設定のみを保存し、アプリ自体が起動管理を回避してこの一覧を変更することはできません。",
  "启动项": "起動項目",
  "桌面会话就绪（session-ready）后，已启用的启动项会按设定延迟依次自动启动。关闭开关即停止该应用的自动启动。": "デスクトップセッションの準備完了（session-ready）後、有効にした起動項目が設定された遅延に従って順次自動起動します。スイッチをオフにすると、そのアプリの自動起動は停止します。",
  "启动项服务尚未就绪，请重新打开设置。": "起動項目サービスの準備ができていません。設定をもう一度開いてください。",
  "正在读取启动项……": "起動項目を読み込み中……",
  "启动项读取失败。": "起動項目の読み込みに失敗しました。",
  "当前没有可配置的应用。": "構成可能なアプリがありません。",
  "后台启动": "バックグラウンド起動",
  "最小化启动": "最小化起動",
  "正常窗口": "通常ウィンドウ",
  "启用": "有効",
  "毫秒": "ミリ秒",
  " 的启动项已保存。": " の起動項目を保存しました。",
  " 的启动项保存失败。": " の起動項目の保存に失敗しました。",
  " 启动模式": " 起動モード",
  " 启动延迟（毫秒）": " 起動遅延（ミリ秒）"
});
Object.assign(languageCatalog.tw, {
  "应用": "應用程式",
  "管理 WebWindows 应用的桌面行为。启动项只保存当前使用者的配置，应用自身不能绕过启动管理修改该列表。": "管理 WebWindows 應用程式的桌面行為。啟動項目只儲存目前使用者的設定，應用程式本身無法繞過啟動管理修改此清單。",
  "启动项": "啟動項目",
  "桌面会话就绪（session-ready）后，已启用的启动项会按设定延迟依次自动启动。关闭开关即停止该应用的自动启动。": "桌面工作階段就緒（session-ready）後，已啟用的啟動項目會依設定延遲依次自動啟動。關閉開關即停止該應用程式的自動啟動。",
  "启动项服务尚未就绪，请重新打开设置。": "啟動項目服務尚未就緒，請重新開啟設定。",
  "正在读取启动项……": "正在讀取啟動項目……",
  "启动项读取失败。": "讀取啟動項目失敗。",
  "当前没有可配置的应用。": "目前沒有可設定的應用程式。",
  "后台启动": "背景啟動",
  "最小化启动": "最小化啟動",
  "正常窗口": "一般視窗",
  "启用": "啟用",
  "毫秒": "毫秒",
  " 的启动项已保存。": " 的啟動項目已儲存。",
  " 的启动项保存失败。": " 的啟動項目儲存失敗。",
  " 启动模式": " 啟動模式",
  " 启动延迟（毫秒）": " 啟動延遲（毫秒）"
});

function translateText(text, language) {
  const dictionary = languageCatalog[language];
  if (!dictionary) return text;
  const translated = Object.keys(dictionary)
    .sort((a, b) => b.length - a.length)
    .reduce((result, source) => result.split(source).join(dictionary[source]), text);
  // 未覆盖的长句不做半句替换，避免出现“已Send”“MailSave”一类混合语言。
  return language === "en" && /[\u3400-\u9fff]/.test(translated) ? text : translated;
}

const translatedAttributes = ["title", "placeholder", "aria-label", "alt"];
const originalText = new WeakMap();
const originalAttributes = new WeakMap();
const observedDocuments = new WeakMap();
const wiredIframes = new WeakSet();

function sourceText(node) {
  if (!originalText.has(node)) originalText.set(node, node.nodeValue || "");
  return originalText.get(node);
}

function sourceAttribute(element, attribute) {
  let attributes = originalAttributes.get(element);
  if (!attributes) { attributes = new Map(); originalAttributes.set(element, attributes); }
  if (!attributes.has(attribute)) attributes.set(attribute, element.getAttribute(attribute));
  return attributes.get(attribute);
}

function applyLanguage(language, container = document.body) {
  if (!container) return;
  const ownerDocument = container.ownerDocument || document;
  const walker = ownerDocument.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const blockedTags = new Set(["SCRIPT", "STYLE", "CODE", "PRE"]);
  const isTranslationBlocked = (element) => blockedTags.has(element?.tagName)
    || Boolean(element?.closest?.(".monaco-editor, [data-i18n-ignore]"));
  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!isTranslationBlocked(node.parentElement)) {
      const source = sourceText(node);
      node.nodeValue = language === "zh" ? source : translateText(source, language);
    }
  }

  const elements = container.nodeType === Node.ELEMENT_NODE
    ? [container, ...container.querySelectorAll("*")]
    : [...container.querySelectorAll("*")];
  elements.forEach((element) => {
    if (isTranslationBlocked(element)) return;
    translatedAttributes.forEach((attribute) => {
      if (element.hasAttribute(attribute)) {
        const source = sourceAttribute(element, attribute);
        element.setAttribute(attribute, language === "zh" ? source : translateText(source, language));
      }
    });
    if (element instanceof ownerDocument.defaultView.HTMLInputElement &&
        ["button", "submit", "reset"].includes(element.type)) {
      const source = sourceAttribute(element, "value");
      element.value = language === "zh" ? source : translateText(source, language);
    }
  });
  const titleElement = ownerDocument.querySelector("title");
  if (titleElement) {
    if (!originalText.has(titleElement)) originalText.set(titleElement, titleElement.textContent || "");
    const source = originalText.get(titleElement);
    titleElement.textContent = language === "zh" ? source : translateText(source, language);
  }
}

function stopObservingDocument(targetDocument) {
  const observer = observedDocuments.get(targetDocument);
  if (observer) observer.disconnect();
  observedDocuments.delete(targetDocument);
}

function observeDocument(targetDocument, language) {
  if (!targetDocument?.body) return;
  applyLanguage(language, targetDocument.body);
  if (observedDocuments.has(targetDocument)) return;

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "characterData") {
        const node = mutation.target;
        if (node.parentElement?.closest?.(".monaco-editor, [data-i18n-ignore]") || ["CODE", "PRE"].includes(node.parentElement?.tagName)) return;
        const remembered = originalText.get(node);
        const expected = remembered == null ? null : (language === "zh" ? remembered : translateText(remembered, language));
        if (remembered == null || node.nodeValue !== expected) originalText.set(node, node.nodeValue || "");
        const source = sourceText(node);
        const translated = language === "zh" ? source : translateText(source, language);
        if (node.nodeValue !== translated) node.nodeValue = translated;
        return;
      }
      if (mutation.type === "attributes") {
        const element = mutation.target;
        if (element.closest?.(".monaco-editor, [data-i18n-ignore]")) return;
        const attribute = mutation.attributeName;
        if (!translatedAttributes.includes(attribute)) return;
        const remembered = originalAttributes.get(element)?.get(attribute);
        const expected = remembered == null ? null : (language === "zh" ? remembered : translateText(remembered, language));
        if (remembered == null || element.getAttribute(attribute) !== expected) {
          let attributes = originalAttributes.get(element);
          if (!attributes) { attributes = new Map(); originalAttributes.set(element, attributes); }
          attributes.set(attribute, element.getAttribute(attribute));
        }
        const source = sourceAttribute(element, attribute);
        const translated = language === "zh" ? source : translateText(source, language);
        if (element.getAttribute(attribute) !== translated) element.setAttribute(attribute, translated);
        return;
      }
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.parentElement?.closest?.(".monaco-editor, [data-i18n-ignore]") || ["CODE", "PRE"].includes(node.parentElement?.tagName)) return;
          const source = sourceText(node);
          node.nodeValue = language === "zh" ? source : translateText(source, language);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          if (node.matches?.(".monaco-editor, [data-i18n-ignore]") || node.closest?.(".monaco-editor, [data-i18n-ignore]")) return;
          applyLanguage(language, node);
          if (node.tagName === "IFRAME") syncIframeLanguage(node, language);
          node.querySelectorAll?.("iframe").forEach((iframe) => syncIframeLanguage(iframe, language));
        }
      });
    });
  });
  observer.observe(targetDocument.body, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: translatedAttributes,
  });
  observedDocuments.set(targetDocument, observer);
  return observer;
}

function syncIframeLanguage(iframe, language) {
  const translateFrame = () => {
    try {
      // 已接入共通语言层的子应用自己维护原文缓存。父子同时改同一 DOM 会把
      // 上一种译文误记为原文，造成 English -> 日本語 时 iframe 仍停在英文。
      if (typeof iframe.contentWindow?.setLanguage === "function") {
        iframe.contentWindow.setLanguage(language);
        return;
      }
      const frameDocument = iframe.contentDocument;
      if (!frameDocument?.body) return;
      frameDocument.documentElement.lang = ({ zh: "zh-CN", tw: "zh-TW", en: "en-US", jp: "ja-JP" }[language] || language);
      stopObservingDocument(frameDocument);
      observeDocument(frameDocument, language);
    } catch (_) {
      // Cross-origin applications own their language handling.
      iframe.contentWindow?.postMessage({ type: "change-language", lang: language }, "*");
    }
  };
  if (!wiredIframes.has(iframe)) {
    wiredIframes.add(iframe);
    iframe.addEventListener("load", translateFrame);
  }
  try {
    if (iframe.contentDocument?.readyState === "complete") translateFrame();
  } catch (_) {
    iframe.contentWindow?.postMessage({ type: "change-language", lang: language }, "*");
  }
}

function setLanguage(language) {
  if (!languageCatalog[language] && language !== "zh") return;
  localStorage.setItem("lang", language);
  applyLanguageToDocument(document, language);
  window.dispatchEvent(new CustomEvent("webwindows:language-changed", { detail: { language } }));
}

function applyLanguageToDocument(targetDocument, language) {
  if (!targetDocument?.body) return;
  targetDocument.documentElement.lang = ({ zh: "zh-CN", tw: "zh-TW", en: "en-US", jp: "ja-JP" }[language] || language);
  stopObservingDocument(targetDocument);
  applyLanguage(language, targetDocument.body);
  observeDocument(targetDocument, language);
  targetDocument.querySelectorAll("iframe").forEach((iframe) => syncIframeLanguage(iframe, language));
}

function setupLanguageControl() {
  if (!localStorage.getItem("lang")) {
    const locale = (navigator.languages?.[0] || navigator.language || "en-US").toLowerCase();
    const initialLanguage = locale.startsWith("ja") ? "jp"
      : (/^zh-(tw|hk|mo)/.test(locale) || locale.includes("hant")) ? "tw"
      : locale.startsWith("zh") ? "zh" : "en";
    localStorage.setItem("lang", initialLanguage);
  }
  const language = localStorage.getItem("lang");
  applyLanguageToDocument(document, language);
  window.setLanguage = setLanguage;
  window.addEventListener("message", (event) => {
    if (event.data?.type === "change-language") setLanguage(event.data.lang);
  });
}

window.WebWindowsI18n = Object.freeze({
  languages: Object.freeze(["zh", "tw", "en", "jp"]),
  getLanguage: () => localStorage.getItem("lang") || "zh",
  getLocale: () => ({ zh: "zh-CN", tw: "zh-TW", en: "en-US", jp: "ja-JP" }[localStorage.getItem("lang") || "zh"]),
  translate: (text, language = localStorage.getItem("lang") || "zh") => language === "zh" ? String(text) : translateText(String(text), language),
  setLanguage,
  apply: applyLanguageToDocument,
  catalog: languageCatalog
});

document.addEventListener("DOMContentLoaded", setupLanguageControl);
