import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Locale = "en" | "fa";

type Dictionary = Record<string, string>;

// Terminal/code tokens (prompts, filenames, JSON-like keys) are intentionally
// left untranslated in both locales — real shell filenames and command
// output don't get translated either.
const translations: Record<Locale, Dictionary> = {
  en: {
    "hero.tagline": "full-stack developer crafting things for the web",
    "hero.location": "Oslo, Norway",
    "hero.about":
      "I'm a full-stack web developer with over 10 years of experience in software development. I work with ASP.NET Core and C# on the backend, and React and TypeScript on the frontend.",
    "hero.about2":
      "I'm curious by nature: I enjoy exploring new technologies and understanding how things work under the hood. I learn best by building, experimenting, and learning from mistakes. When I commit to something, I stick with it and see it through.",
    "card.projects.description": "Explore what I've built and what I'm building",
    "card.projects.button": "view projects",
    "card.blogs.description": "Thoughts, guides, and dev explorations",
    "card.blogs.button": "read the blog",
    "card.contact.description": "Let's talk — I'm just one click away",
    "card.contact.button": "get in touch",
    "comingSoon.warning": "nothing here yet — under construction",
    "comingSoon.building": "building",
    "comingSoon.body":
      "Still writing this one. Check back soon — or ping me directly, I don't bite.",
    "nav.toggleMenu": "Toggle menu",
    "nav.siteNavigation": "Site navigation",
    "nav.switchToFa": "Switch to Persian",
    "nav.switchToEn": "Switch to English",
    "avatar.label": "Faramarz — web, AI, and software engineering",
    "contact.heading": "Let's build something together.",
    "contact.intro":
      "Got a project, a question, or just want to say hi? Send me a message — I read every one.",
    "contact.form.name.placeholder": "Ada Lovelace",
    "contact.form.email.placeholder": "you@example.com",
    "contact.form.message.placeholder": "What's on your mind?",
    "contact.form.submit": "Send message",
    "contact.form.sending": "Sending",
    "contact.form.success": "Message sent. I'll get back to you soon.",
    "contact.form.error":
      "Something went wrong. Please try again, or email me directly.",
    "contact.form.error.rateLimit":
      "Too many messages for now — please try again in a bit.",
    "contact.form.validation.name": "Please enter your name.",
    "contact.form.validation.email": "Please enter a valid email address.",
    "contact.form.validation.message":
      "Tell me a bit more — at least 10 characters.",
    "contact.alt": "Prefer another way? Find me here too:",

    "projects.kind.experiment": "Experiment",
    "projects.kind.project": "Project",
    "projects.new": "New",
    "projects.viewProject": "view project",
    "projects.slidingPuzzle.description":
      "A responsive image puzzle built with TypeScript and the Canvas API. It uses a testable game engine separated from rendering and input, and supports both built-in images and local image uploads.",
    "projects.financeTracker.description":
      "A mobile-first household finance tracker — public demo, runs entirely in the browser with data stored locally in IndexedDB. Installable as a PWA. Full English/Persian and LTR/RTL support.",

    "puzzle.heading": "Sliding Puzzle",
    "puzzle.intro":
      "A small experiment in TypeScript, React, and the Canvas API: a classic 15-puzzle with a testable game engine kept separate from rendering and input. Pick an image, choose a difficulty, and reassemble it.",
    "puzzle.loadingImage": "Loading image…",
    "puzzle.goodJob": "Good job!",
    "puzzle.instructions":
      "Use the arrow keys, or tap or click a tile, to slide it into the empty space and reconstruct the image.",
    "puzzle.boardAriaLabel": "Sliding puzzle board, {grid} by {grid}, {moves} moves so far",
    "puzzle.imageLabel": "Image",
    "puzzle.uploadNote": "Uploaded images stay in your browser — they're never sent anywhere.",
    "puzzle.confirmDifficultyChange":
      "Changing difficulty will reset your current progress. Continue?",
    "puzzle.confirmImageChange": "Starting a new image will reset your current progress. Continue?",
    "puzzle.hintNotFound":
      "Couldn't find a quick hint for this one — it happens on harder boards. Try again, or switch to an easier difficulty.",

    "puzzle.controls.easy": "3×3 · Easy",
    "puzzle.controls.medium": "4×4 · Medium",
    "puzzle.controls.hard": "5×5 · Hard",
    "puzzle.controls.elapsedTimeAria": "Elapsed time {time}",
    "puzzle.controls.move": "move",
    "puzzle.controls.moves": "moves",
    "puzzle.controls.hint": "Hint",
    "puzzle.controls.shuffle": "Shuffle",

    "puzzle.imagePicker.groupLabel": "Choose an image",
    "puzzle.imagePicker.upload": "Upload",
    "puzzle.imagePicker.uploadAria": "Upload your own image",

    "puzzle.completion.solved": "Puzzle solved!",
    "puzzle.completion.playAgain": "Play again",
    "puzzle.completion.chooseImage": "Choose another image",

    "puzzle.error.svgNotSupported":
      "SVG files aren't supported. Please choose a JPEG, PNG, or WebP image.",
    "puzzle.error.invalidType": "Unsupported file type. Please choose a JPEG, PNG, or WebP image.",
    "puzzle.error.tooLarge": "That image is too large (max {mb}MB).",
    "puzzle.error.decodeFailed":
      "That image couldn't be read. It may be corrupted or in an unsupported format.",
    "puzzle.error.networkFailed": "Couldn't load that image. Please try another one.",
    "puzzle.error.unsupported": "Canvas isn't available in this browser.",
    "puzzle.error.generic": "Something went wrong loading that image.",
    "puzzle.error.fileUnusable": "That file couldn't be used.",
    "puzzle.canvasUnsupported":
      "This browser doesn't support the 2D canvas features this game needs.",

    "finance.nav.dashboard": "Dashboard",
    "finance.nav.transactions": "Transactions",
    "finance.nav.categories": "Categories",
    "finance.nav.settings": "Settings",
    "finance.nav.addTransaction": "Add transaction",

    "finance.demoMode.badge": "Demo Mode — data is stored only on this device.",

    "finance.category.groceries": "Groceries",
    "finance.category.house": "House",
    "finance.category.mortgage": "Mortgage",
    "finance.category.car": "Car",
    "finance.category.restaurant": "Restaurant",
    "finance.category.shopping": "Shopping",
    "finance.category.child": "Child",
    "finance.category.travel": "Travel",
    "finance.category.health": "Health",
    "finance.category.entertainment": "Entertainment",
    "finance.category.other": "Other",
    "finance.category.salary": "Salary",
    "finance.category.rental-income": "Rental income",
    "finance.category.other-income": "Other income",

    "finance.dashboard.heading": "Dashboard",
    "finance.dashboard.income": "Income",
    "finance.dashboard.expenses": "Expenses",
    "finance.dashboard.period.previous": "Previous period",
    "finance.dashboard.period.next": "Next period",
    "finance.dashboard.forecast.label": "Forecast",
    "finance.dashboard.actual.label": "Actual",
    "finance.dashboard.expectedRemaining": "Expected remaining, after upcoming fixed expenses",
    "finance.dashboard.currentBalance": "Current balance",
    "finance.dashboard.paidExpenses": "Paid expenses",
    "finance.dashboard.upcomingFixed": "Upcoming fixed",

    "finance.transactions.heading": "Transactions",
    "finance.categories.heading": "Categories",
    "finance.settings.heading": "Settings",

    "finance.quickAdd.type.expense": "Expense",
    "finance.quickAdd.type.income": "Income",
    "finance.quickAdd.amountLabel": "Amount",
    "finance.quickAdd.dateLabel": "Date",
    "finance.quickAdd.notePlaceholder": "Note (optional)",
    "finance.quickAdd.save": "Save",
    "finance.quickAdd.saved": "Saved",
    "finance.quickAdd.deleted": "Deleted",
    "finance.quickAdd.delete": "Delete",
    "finance.quickAdd.confirmDelete": "Delete this transaction? This can't be undone.",
    "finance.quickAdd.error.amount": "Enter a valid amount.",
    "finance.quickAdd.error.category": "Choose a category.",
    "finance.quickAdd.error.saveFailed": "Something went wrong saving this. Please try again.",

    "finance.dashboard.viewTransactions": "View all transactions",
    "finance.dashboard.empty": "No transactions yet this month. Add your first one.",
    "finance.dashboard.noExpenses": "No expenses yet this month.",
    "finance.dashboard.byCategory": "By category",
    "finance.dashboard.recent": "Recent transactions",

    "finance.transactions.filter.all": "All",
    "finance.transactions.filter.expense": "Expense",
    "finance.transactions.filter.income": "Income",
    "finance.transactions.filter.allCategories": "All categories",
    "finance.transactions.filter.typeGroupLabel": "Filter by type",
    "finance.transactions.empty": "No transactions yet. Add your first one.",

    "finance.categories.rename": "Rename",
    "finance.categories.delete": "Delete",
    "finance.categories.save": "Save",
    "finance.categories.cancel": "Cancel",
    "finance.categories.add": "Add category",
    "finance.categories.namePlaceholder": "Category name",
    "finance.categories.confirmDelete": "Delete this category? This can't be undone.",
    "finance.categories.error.inUse": "Used by {count} transaction(s) — can't be deleted.",

    "finance.settings.language.heading": "Language",

    "finance.settings.financialPeriod.heading": "Financial period",
    "finance.settings.financialPeriod.startsOn": "Financial month starts on",
    "finance.settings.financialPeriod.dayOfMonth": "day of the month",

    "finance.settings.fixedExpensesSection": "Fixed Expenses",
    "finance.settings.manageFixedExpenses": "Manage fixed expenses",

    "finance.fixedExpenses.heading": "Fixed Expenses",
    "finance.fixedExpenses.namePlaceholder": "Name (e.g. Electricity)",
    "finance.fixedExpenses.dueDayPlaceholder": "Due day (optional)",
    "finance.fixedExpenses.dueDayShort": "due day {day}",
    "finance.fixedExpenses.status.paid": "Paid",
    "finance.fixedExpenses.status.upcoming": "Upcoming",
    "finance.fixedExpenses.unmarkPaid": "Unmark as paid",
    "finance.fixedExpenses.overrideAmount": "Adjust amount",
    "finance.fixedExpenses.overridden": "adjusted for this period",
    "finance.fixedExpenses.clearOverride": "Reset to default amount",
    "finance.fixedExpenses.edit": "Edit",
    "finance.fixedExpenses.archive": "Archive",
    "finance.fixedExpenses.confirmArchive": "Archive \"{name}\"? It will no longer show as an upcoming expense, but past history is kept.",
    "finance.fixedExpenses.archived": "Fixed expense archived",
    "finance.fixedExpenses.add": "Add fixed expense",
    "finance.fixedExpenses.added": "Fixed expense added",
    "finance.fixedExpenses.empty": "No fixed expenses yet. Add rent, subscriptions, or bills that repeat every period.",
    "finance.fixedExpenses.unmarkedPaid": "Marked as unpaid",
    "finance.fixedExpenses.error.name": "Enter a name.",
    "finance.fixedExpenses.error.dueDay": "Due day must be between 1 and 31.",
    "finance.fixedExpenses.markAsPaid": "Mark as paid",
    "finance.fixedExpenses.markedPaid": "Marked as paid",
    "finance.fixedExpenses.confirmPaid": "Confirm payment",
    "finance.fixedExpenses.upcomingCarousel": "Upcoming fixed expenses",
    "finance.fixedExpenses.allPaid": "All fixed expenses are paid for this period. Nicely done.",
    "finance.fixedExpenses.progress": "{paid} of {total} paid",
    "finance.fixedExpenses.remaining": "remaining",

    "finance.settings.demoData": "Demo & Data",
    "finance.settings.loadSampleData": "Load sample data",
    "finance.settings.restoreDefaultCategories": "Restore default categories",
    "finance.settings.resetDemo": "Reset demo",
    "finance.settings.demoDataHint": "These only affect the data stored on this device.",
    "finance.settings.confirmReset": "Reset all demo data? This deletes every transaction and custom category and can't be undone.",
    "finance.settings.sampleDataLoaded": "Sample data loaded",
    "finance.settings.resetDone": "Demo reset",
    "finance.settings.categoriesRestored": "Default categories restored",
  },
  fa: {
    "hero.tagline": "توسعه‌دهنده full-stack که برای وب چیز می‌سازه",
    "hero.location": "اسلو، نروژ",
    "hero.about":
      "من یه توسعه‌دهنده وب full-stack هستم با بیش از ۱۰ سال تجربه توی توسعه نرم‌افزار. توی بک‌اند با ASP.NET Core و C# کار می‌کنم و توی فرانت‌اند با React و TypeScript.",
    "hero.about2":
      "کنجکاوی جزو ذاتمه: از کشف تکنولوژی‌های جدید و فهمیدن اینکه زیر پوستشون چه خبره لذت می‌برم. بهترین یادگیریم از طریق ساختن، آزمایش‌کردن و یادگرفتن از اشتباهاته. وقتی به چیزی متعهد می‌شم، تا آخرش پیش می‌رم.",
    "card.projects.description": "ببین چی ساختم و دارم چی می‌سازم",
    "card.projects.button": "دیدن پروژه‌ها",
    "card.blogs.description": "فکرها، راهنماها و کندوکاوهای برنامه‌نویسی",
    "card.blogs.button": "خواندن بلاگ",
    "card.contact.description": "بیا حرف بزنیم — فقط یه کلیک باهام فاصله داری",
    "card.contact.button": "در تماس باش",
    "comingSoon.warning": "هنوز چیزی اینجا نیست — در حال ساخته",
    "comingSoon.building": "در حال ساخت",
    "comingSoon.body":
      "هنوز دارم روش کار می‌کنم. یه‌کم دیگه سر بزن — یا مستقیم بهم پیام بده، گاز نمی‌گیرم.",
    "nav.toggleMenu": "باز و بسته کردن منو",
    "nav.siteNavigation": "منوی سایت",
    "nav.switchToFa": "تغییر زبان به فارسی",
    "nav.switchToEn": "تغییر زبان به انگلیسی",
    "avatar.label": "فرامرز — وب، هوش مصنوعی و مهندسی نرم‌افزار",
    "contact.heading": "بیا با هم یه چیزی بسازیم.",
    "contact.intro":
      "پروژه‌ای داری، سوالی داری، یا فقط می‌خوای سلام کنی؟ برام پیام بذار — همه‌شونو می‌خونم.",
    "contact.form.name.placeholder": "مثلاً: سارا محمدی",
    "contact.form.email.placeholder": "you@example.com",
    "contact.form.message.placeholder": "چی تو ذهنته؟",
    "contact.form.submit": "ارسال پیام",
    "contact.form.sending": "در حال ارسال",
    "contact.form.success": "پیام ارسال شد. به‌زودی جواب می‌دم.",
    "contact.form.error":
      "یه مشکلی پیش اومد. دوباره امتحان کن یا مستقیم برام ایمیل بزن.",
    "contact.form.error.rateLimit":
      "فعلاً پیام زیاد فرستادی — یه‌کم دیگه دوباره امتحان کن.",
    "contact.form.validation.name": "لطفاً اسمت رو بنویس.",
    "contact.form.validation.email": "لطفاً یه ایمیل معتبر بنویس.",
    "contact.form.validation.message": "یه‌کم بیشتر بنویس — حداقل ۱۰ کاراکتر.",
    "contact.alt": "یه راه دیگه رو ترجیح می‌دی؟ اینجاها هم پیدام می‌کنی:",

    "projects.kind.experiment": "آزمایش",
    "projects.kind.project": "پروژه",
    "projects.new": "جدید",
    "projects.viewProject": "دیدن پروژه",
    "projects.slidingPuzzle.description":
      "یه پازل تصویری واکنش‌گرا که با TypeScript و Canvas API ساخته شده. از یه موتور بازی قابل‌تست استفاده می‌کنه که از رندر و ورودی جداست، و هم عکس‌های آماده رو پشتیبانی می‌کنه هم آپلود عکس دلخواه.",
    "projects.financeTracker.description":
      "یه ردیاب مالی خانواده موبایل-محور — نسخه دمو عمومی که کاملاً توی مرورگر اجرا می‌شه و داده‌ها به‌صورت محلی توی IndexedDB ذخیره می‌شن. قابل نصب به‌عنوان PWA. پشتیبانی کامل از فارسی/انگلیسی و راست‌به‌چپ/چپ‌به‌راست.",

    "puzzle.heading": "پازل کشویی",
    "puzzle.intro":
      "یه آزمایش کوچیک با TypeScript، React و Canvas API: یه پازل ۱۵-تایی کلاسیک با یه موتور بازی قابل‌تست که از رندر و ورودی جداست. یه عکس انتخاب کن، سطح سختی رو مشخص کن، و دوباره بچینش.",
    "puzzle.loadingImage": "در حال بارگذاری عکس…",
    "puzzle.goodJob": "آفرین!",
    "puzzle.instructions":
      "با کلیدهای جهت‌دار، یا با ضربه‌زدن/کلیک روی یه قطعه، اونو به فضای خالی بلغزون و عکس رو دوباره بچین.",
    "puzzle.boardAriaLabel": "تخته پازل کشویی، {grid} در {grid}، {moves} حرکت تا الان",
    "puzzle.imageLabel": "عکس",
    "puzzle.uploadNote": "عکس‌های آپلودشده توی مرورگرت می‌مونن — هیچ‌وقت جایی فرستاده نمی‌شن.",
    "puzzle.confirmDifficultyChange": "تغییر سطح سختی پیشرفت فعلیت رو پاک می‌کنه. ادامه بدم؟",
    "puzzle.confirmImageChange": "شروع با عکس جدید پیشرفت فعلیت رو پاک می‌کنه. ادامه بدم؟",
    "puzzle.hintNotFound":
      "نتونستم سریع یه راهنمایی پیدا کنم — تو تخته‌های سخت‌تر پیش میاد. دوباره امتحان کن، یا سطح سختی رو کم‌تر کن.",

    "puzzle.controls.easy": "3×3 · آسان",
    "puzzle.controls.medium": "4×4 · متوسط",
    "puzzle.controls.hard": "5×5 · سخت",
    "puzzle.controls.elapsedTimeAria": "زمان سپری‌شده {time}",
    "puzzle.controls.move": "حرکت",
    "puzzle.controls.moves": "حرکت",
    "puzzle.controls.hint": "راهنمایی",
    "puzzle.controls.shuffle": "به‌هم‌ریختن",

    "puzzle.imagePicker.groupLabel": "یه عکس انتخاب کن",
    "puzzle.imagePicker.upload": "آپلود",
    "puzzle.imagePicker.uploadAria": "عکس دلخواه خودت رو آپلود کن",

    "puzzle.completion.solved": "پازل حل شد!",
    "puzzle.completion.playAgain": "دوباره بازی کن",
    "puzzle.completion.chooseImage": "یه عکس دیگه انتخاب کن",

    "puzzle.error.svgNotSupported":
      "فایل‌های SVG پشتیبانی نمی‌شن. لطفاً یه عکس JPEG، PNG یا WebP انتخاب کن.",
    "puzzle.error.invalidType": "این نوع فایل پشتیبانی نمی‌شه. لطفاً یه عکس JPEG، PNG یا WebP انتخاب کن.",
    "puzzle.error.tooLarge": "این عکس خیلی بزرگه (حداکثر {mb} مگابایت).",
    "puzzle.error.decodeFailed": "این عکس قابل‌خوندن نبود. ممکنه خراب باشه یا فرمتش پشتیبانی نشه.",
    "puzzle.error.networkFailed": "نتونستم این عکس رو بارگذاری کنم. یه عکس دیگه امتحان کن.",
    "puzzle.error.unsupported": "Canvas تو این مرورگر در دسترس نیست.",
    "puzzle.error.generic": "یه مشکلی موقع بارگذاری عکس پیش اومد.",
    "puzzle.error.fileUnusable": "نتونستم از این فایل استفاده کنم.",
    "puzzle.canvasUnsupported":
      "این مرورگر از قابلیت‌های Canvas دوبعدی که این بازی لازم داره پشتیبانی نمی‌کنه.",

    "finance.nav.dashboard": "داشبورد",
    "finance.nav.transactions": "تراکنش‌ها",
    "finance.nav.categories": "دسته‌بندی‌ها",
    "finance.nav.settings": "تنظیمات",
    "finance.nav.addTransaction": "افزودن تراکنش",

    "finance.demoMode.badge": "حالت دمو — اطلاعات فقط روی همین دستگاه ذخیره می‌شه.",

    "finance.category.groceries": "مواد غذایی",
    "finance.category.house": "خانه",
    "finance.category.mortgage": "وام مسکن",
    "finance.category.car": "ماشین",
    "finance.category.restaurant": "رستوران",
    "finance.category.shopping": "خرید",
    "finance.category.child": "فرزند",
    "finance.category.travel": "سفر",
    "finance.category.health": "سلامت",
    "finance.category.entertainment": "سرگرمی",
    "finance.category.other": "متفرقه",
    "finance.category.salary": "حقوق",
    "finance.category.rental-income": "درآمد اجاره",
    "finance.category.other-income": "درآمد متفرقه",

    "finance.dashboard.heading": "داشبورد",
    "finance.dashboard.income": "درآمد",
    "finance.dashboard.expenses": "هزینه‌ها",
    "finance.dashboard.period.previous": "دوره قبل",
    "finance.dashboard.period.next": "دوره بعد",
    "finance.dashboard.forecast.label": "پیش‌بینی",
    "finance.dashboard.actual.label": "واقعی",
    "finance.dashboard.expectedRemaining": "باقی‌مانده تخمینی، پس از هزینه‌های ثابت در پیش",
    "finance.dashboard.currentBalance": "موجودی فعلی",
    "finance.dashboard.paidExpenses": "هزینه‌های پرداخت‌شده",
    "finance.dashboard.upcomingFixed": "ثابت‌های در پیش",

    "finance.transactions.heading": "تراکنش‌ها",
    "finance.categories.heading": "دسته‌بندی‌ها",
    "finance.settings.heading": "تنظیمات",

    "finance.quickAdd.type.expense": "هزینه",
    "finance.quickAdd.type.income": "درآمد",
    "finance.quickAdd.amountLabel": "مبلغ",
    "finance.quickAdd.dateLabel": "تاریخ",
    "finance.quickAdd.notePlaceholder": "یادداشت (اختیاری)",
    "finance.quickAdd.save": "ذخیره",
    "finance.quickAdd.saved": "ذخیره شد",
    "finance.quickAdd.deleted": "حذف شد",
    "finance.quickAdd.delete": "حذف",
    "finance.quickAdd.confirmDelete": "این تراکنش حذف بشه؟ این کار قابل برگشت نیست.",
    "finance.quickAdd.error.amount": "یه مبلغ معتبر وارد کن.",
    "finance.quickAdd.error.category": "یه دسته‌بندی انتخاب کن.",
    "finance.quickAdd.error.saveFailed": "یه مشکلی توی ذخیره‌سازی پیش اومد. دوباره امتحان کن.",

    "finance.dashboard.viewTransactions": "دیدن همه تراکنش‌ها",
    "finance.dashboard.empty": "هنوز تراکنشی توی این ماه نیست. اولین تراکنش رو اضافه کن.",
    "finance.dashboard.noExpenses": "هنوز هزینه‌ای توی این ماه نیست.",
    "finance.dashboard.byCategory": "بر اساس دسته‌بندی",
    "finance.dashboard.recent": "تراکنش‌های اخیر",

    "finance.transactions.filter.all": "همه",
    "finance.transactions.filter.expense": "هزینه",
    "finance.transactions.filter.income": "درآمد",
    "finance.transactions.filter.allCategories": "همه دسته‌بندی‌ها",
    "finance.transactions.filter.typeGroupLabel": "فیلتر بر اساس نوع",
    "finance.transactions.empty": "هنوز تراکنشی نیست. اولین تراکنش رو اضافه کن.",

    "finance.categories.rename": "تغییر نام",
    "finance.categories.delete": "حذف",
    "finance.categories.save": "ذخیره",
    "finance.categories.cancel": "لغو",
    "finance.categories.add": "افزودن دسته‌بندی",
    "finance.categories.namePlaceholder": "نام دسته‌بندی",
    "finance.categories.confirmDelete": "این دسته‌بندی حذف بشه؟ این کار قابل برگشت نیست.",
    "finance.categories.error.inUse": "توسط {count} تراکنش استفاده شده — قابل حذف نیست.",

    "finance.settings.language.heading": "زبان",

    "finance.settings.financialPeriod.heading": "دوره مالی",
    "finance.settings.financialPeriod.startsOn": "ماه مالی از این روز شروع می‌شه",
    "finance.settings.financialPeriod.dayOfMonth": "روز از ماه",

    "finance.settings.fixedExpensesSection": "هزینه‌های ثابت",
    "finance.settings.manageFixedExpenses": "مدیریت هزینه‌های ثابت",

    "finance.fixedExpenses.heading": "هزینه‌های ثابت",
    "finance.fixedExpenses.namePlaceholder": "نام (مثلاً: برق)",
    "finance.fixedExpenses.dueDayPlaceholder": "روز سررسید (اختیاری)",
    "finance.fixedExpenses.dueDayShort": "سررسید روز {day}",
    "finance.fixedExpenses.status.paid": "پرداخت‌شده",
    "finance.fixedExpenses.status.upcoming": "در پیش",
    "finance.fixedExpenses.unmarkPaid": "لغو پرداخت‌شده",
    "finance.fixedExpenses.overrideAmount": "تغییر مبلغ",
    "finance.fixedExpenses.overridden": "برای این دوره تغییر کرده",
    "finance.fixedExpenses.clearOverride": "بازگشت به مبلغ پیش‌فرض",
    "finance.fixedExpenses.edit": "ویرایش",
    "finance.fixedExpenses.archive": "بایگانی",
    "finance.fixedExpenses.confirmArchive": "«{name}» بایگانی بشه؟ دیگه به‌عنوان هزینه در پیش نشون داده نمی‌شه، اما تاریخچه‌اش حفظ می‌مونه.",
    "finance.fixedExpenses.archived": "هزینه ثابت بایگانی شد",
    "finance.fixedExpenses.add": "افزودن هزینه ثابت",
    "finance.fixedExpenses.added": "هزینه ثابت اضافه شد",
    "finance.fixedExpenses.empty": "هنوز هزینه ثابتی نیست. اجاره، اشتراک‌ها یا قبض‌هایی که هر دوره تکرار می‌شن رو اضافه کن.",
    "finance.fixedExpenses.unmarkedPaid": "به‌عنوان پرداخت‌نشده علامت خورد",
    "finance.fixedExpenses.error.name": "یه اسم وارد کن.",
    "finance.fixedExpenses.error.dueDay": "روز سررسید باید بین ۱ تا ۳۱ باشه.",
    "finance.fixedExpenses.markAsPaid": "علامت به‌عنوان پرداخت‌شده",
    "finance.fixedExpenses.markedPaid": "به‌عنوان پرداخت‌شده علامت خورد",
    "finance.fixedExpenses.confirmPaid": "تأیید پرداخت",
    "finance.fixedExpenses.upcomingCarousel": "هزینه‌های ثابت در پیش",
    "finance.fixedExpenses.allPaid": "همه هزینه‌های ثابت این دوره پرداخت شدن. آفرین.",
    "finance.fixedExpenses.progress": "{paid} از {total} پرداخت شده",
    "finance.fixedExpenses.remaining": "باقی‌مانده",

    "finance.settings.demoData": "دمو و داده‌ها",
    "finance.settings.loadSampleData": "بارگذاری داده نمونه",
    "finance.settings.restoreDefaultCategories": "بازیابی دسته‌بندی‌های پیش‌فرض",
    "finance.settings.resetDemo": "بازنشانی دمو",
    "finance.settings.demoDataHint": "این‌ها فقط روی اطلاعات ذخیره‌شده روی همین دستگاه تأثیر می‌ذارن.",
    "finance.settings.confirmReset": "همه داده‌های دمو بازنشانی بشه؟ همه تراکنش‌ها و دسته‌بندی‌های سفارشی حذف می‌شن و قابل برگشت نیست.",
    "finance.settings.sampleDataLoaded": "داده نمونه بارگذاری شد",
    "finance.settings.resetDone": "دمو بازنشانی شد",
    "finance.settings.categoriesRestored": "دسته‌بندی‌های پیش‌فرض بازیابی شدن",
  },
};

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  /** Looks up `key`; if `params` is given, replaces `{name}` placeholders in the result. */
  t: (key: string, params?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const STORAGE_KEY = "iamfara:locale";

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === "undefined") return "en";
    return window.localStorage.getItem(STORAGE_KEY) === "fa" ? "fa" : "en";
  });

  useEffect(() => {
    document.documentElement.lang = locale;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // localStorage can be unavailable (e.g. private browsing) — losing
      // the saved preference isn't worth failing over.
    }
  }, [locale]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
      toggleLocale: () =>
        setLocaleState((prev) => (prev === "en" ? "fa" : "en")),
      t: (key: string, params?: Record<string, string | number>) => {
        const template = translations[locale][key] ?? key;
        if (!params) return template;
        return Object.entries(params).reduce(
          (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
          template
        );
      },
    }),
    [locale]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return ctx;
}

/**
 * The `dir` to set on a block-level element (paragraph, button, etc.) that
 * holds translated prose, so it's actually right-aligned and reads in the
 * correct order for Persian — an inline dir on a nested span isn't enough
 * once the text wraps across multiple lines.
 */
export function dirFor(locale: Locale) {
  return locale === "fa" ? "rtl" : "ltr";
}

/** Renders a translated string with the right text direction for the current locale. */
export function T({
  k,
  params,
  className,
}: {
  k: string;
  params?: Record<string, string | number>;
  className?: string;
}) {
  const { t, locale } = useLocale();
  return (
    <span dir={locale === "fa" ? "rtl" : undefined} className={className}>
      {t(k, params)}
    </span>
  );
}
