(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/ui/skeleton.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Skeleton",
    ()=>Skeleton
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Skeleton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "skeleton",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-accent animate-pulse rounded-md", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/skeleton.tsx",
        lineNumber: 5,
        columnNumber: 5
    }, this);
}
_c = Skeleton;
;
var _c;
__turbopack_context__.k.register(_c, "Skeleton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/table.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Table",
    ()=>Table,
    "TableBody",
    ()=>TableBody,
    "TableCaption",
    ()=>TableCaption,
    "TableCell",
    ()=>TableCell,
    "TableFooter",
    ()=>TableFooter,
    "TableHead",
    ()=>TableHead,
    "TableHeader",
    ()=>TableHeader,
    "TableRow",
    ()=>TableRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
function Table({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "table-container",
        className: "relative w-full overflow-x-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("table", {
            "data-slot": "table",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full caption-bottom text-sm", className),
            ...props
        }, void 0, false, {
            fileName: "[project]/src/components/ui/table.tsx",
            lineNumber: 13,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 9,
        columnNumber: 5
    }, this);
}
_c = Table;
function TableHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("thead", {
        "data-slot": "table-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("[&_tr]:border-b", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 24,
        columnNumber: 5
    }, this);
}
_c1 = TableHeader;
function TableBody({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tbody", {
        "data-slot": "table-body",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("[&_tr:last-child]:border-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 34,
        columnNumber: 5
    }, this);
}
_c2 = TableBody;
function TableFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tfoot", {
        "data-slot": "table-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c3 = TableFooter;
function TableRow({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("tr", {
        "data-slot": "table-row",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 57,
        columnNumber: 5
    }, this);
}
_c4 = TableRow;
function TableHead({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("th", {
        "data-slot": "table-head",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 70,
        columnNumber: 5
    }, this);
}
_c5 = TableHead;
function TableCell({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("td", {
        "data-slot": "table-cell",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
_c6 = TableCell;
function TableCaption({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("caption", {
        "data-slot": "table-caption",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground mt-4 text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/table.tsx",
        lineNumber: 99,
        columnNumber: 5
    }, this);
}
_c7 = TableCaption;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "Table");
__turbopack_context__.k.register(_c1, "TableHeader");
__turbopack_context__.k.register(_c2, "TableBody");
__turbopack_context__.k.register(_c3, "TableFooter");
__turbopack_context__.k.register(_c4, "TableRow");
__turbopack_context__.k.register(_c5, "TableHead");
__turbopack_context__.k.register(_c6, "TableCell");
__turbopack_context__.k.register(_c7, "TableCaption");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Select",
    ()=>Select,
    "SelectContent",
    ()=>SelectContent,
    "SelectGroup",
    ()=>SelectGroup,
    "SelectItem",
    ()=>SelectItem,
    "SelectLabel",
    ()=>SelectLabel,
    "SelectScrollDownButton",
    ()=>SelectScrollDownButton,
    "SelectScrollUpButton",
    ()=>SelectScrollUpButton,
    "SelectSeparator",
    ()=>SelectSeparator,
    "SelectTrigger",
    ()=>SelectTrigger,
    "SelectValue",
    ()=>SelectValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-select/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as CheckIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDownIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-up.js [app-client] (ecmascript) <export default as ChevronUpIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
;
function Select({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "select",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = Select;
function SelectGroup({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Group"], {
        "data-slot": "select-group",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 18,
        columnNumber: 10
    }, this);
}
_c1 = SelectGroup;
function SelectValue({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Value"], {
        "data-slot": "select-value",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 24,
        columnNumber: 10
    }, this);
}
_c2 = SelectValue;
function SelectTrigger({ className, size = "default", children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "select-trigger",
        "data-size": size,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Icon"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
                    className: "size-4 opacity-50"
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 47,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/select.tsx",
                lineNumber: 46,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_c3 = SelectTrigger;
function SelectContent({ className, children, position = "popper", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
            "data-slot": "select-content",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-popover text-popover-foreground data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 relative z-50 max-h-(--radix-select-content-available-height) min-w-[8rem] origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-md border shadow-md", position === "popper" && "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className),
            position: position,
            ...props,
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollUpButton, {}, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 72,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Viewport"], {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("p-1", position === "popper" && "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)] scroll-my-1"),
                    children: children
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 73,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SelectScrollDownButton, {}, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 82,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/ui/select.tsx",
            lineNumber: 61,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 60,
        columnNumber: 5
    }, this);
}
_c4 = SelectContent;
function SelectLabel({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
        "data-slot": "select-label",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground px-2 py-1.5 text-xs", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 93,
        columnNumber: 5
    }, this);
}
_c5 = SelectLabel;
function SelectItem({ className, children, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Item"], {
        "data-slot": "select-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "absolute right-2 flex size-3.5 items-center justify-center",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemIndicator"], {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckIcon$3e$__["CheckIcon"], {
                        className: "size-4"
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/select.tsx",
                        lineNumber: 117,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/ui/select.tsx",
                    lineNumber: 116,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/select.tsx",
                lineNumber: 115,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ItemText"], {
                children: children
            }, void 0, false, {
                fileName: "[project]/src/components/ui/select.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_c6 = SelectItem;
function SelectSeparator({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Separator"], {
        "data-slot": "select-separator",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-border pointer-events-none -mx-1 my-1 h-px", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 130,
        columnNumber: 5
    }, this);
}
_c7 = SelectSeparator;
function SelectScrollUpButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollUpButton"], {
        "data-slot": "select-scroll-up-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronUpIcon$3e$__["ChevronUpIcon"], {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/select.tsx",
            lineNumber: 151,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 143,
        columnNumber: 5
    }, this);
}
_c8 = SelectScrollUpButton;
function SelectScrollDownButton({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$select$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ScrollDownButton"], {
        "data-slot": "select-scroll-down-button",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex cursor-default items-center justify-center py-1", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDownIcon$3e$__["ChevronDownIcon"], {
            className: "size-4"
        }, void 0, false, {
            fileName: "[project]/src/components/ui/select.tsx",
            lineNumber: 169,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/select.tsx",
        lineNumber: 161,
        columnNumber: 5
    }, this);
}
_c9 = SelectScrollDownButton;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9;
__turbopack_context__.k.register(_c, "Select");
__turbopack_context__.k.register(_c1, "SelectGroup");
__turbopack_context__.k.register(_c2, "SelectValue");
__turbopack_context__.k.register(_c3, "SelectTrigger");
__turbopack_context__.k.register(_c4, "SelectContent");
__turbopack_context__.k.register(_c5, "SelectLabel");
__turbopack_context__.k.register(_c6, "SelectItem");
__turbopack_context__.k.register(_c7, "SelectSeparator");
__turbopack_context__.k.register(_c8, "SelectScrollUpButton");
__turbopack_context__.k.register(_c9, "SelectScrollDownButton");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/alert-dialog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AlertDialog",
    ()=>AlertDialog,
    "AlertDialogAction",
    ()=>AlertDialogAction,
    "AlertDialogCancel",
    ()=>AlertDialogCancel,
    "AlertDialogContent",
    ()=>AlertDialogContent,
    "AlertDialogDescription",
    ()=>AlertDialogDescription,
    "AlertDialogFooter",
    ()=>AlertDialogFooter,
    "AlertDialogHeader",
    ()=>AlertDialogHeader,
    "AlertDialogOverlay",
    ()=>AlertDialogOverlay,
    "AlertDialogPortal",
    ()=>AlertDialogPortal,
    "AlertDialogTitle",
    ()=>AlertDialogTitle,
    "AlertDialogTrigger",
    ()=>AlertDialogTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-alert-dialog/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
"use client";
;
;
;
;
function AlertDialog({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "alert-dialog",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 12,
        columnNumber: 10
    }, this);
}
_c = AlertDialog;
function AlertDialogTrigger({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "alert-dialog-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 19,
        columnNumber: 5
    }, this);
}
_c1 = AlertDialogTrigger;
function AlertDialogPortal({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Portal"], {
        "data-slot": "alert-dialog-portal",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 27,
        columnNumber: 5
    }, this);
}
_c2 = AlertDialogPortal;
function AlertDialogOverlay({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Overlay"], {
        "data-slot": "alert-dialog-overlay",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 36,
        columnNumber: 5
    }, this);
}
_c3 = AlertDialogOverlay;
function AlertDialogContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AlertDialogPortal, {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(AlertDialogOverlay, {}, void 0, false, {
                fileName: "[project]/src/components/ui/alert-dialog.tsx",
                lineNumber: 53,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
                "data-slot": "alert-dialog-content",
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg", className),
                ...props
            }, void 0, false, {
                fileName: "[project]/src/components/ui/alert-dialog.tsx",
                lineNumber: 54,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c4 = AlertDialogContent;
function AlertDialogHeader({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "alert-dialog-header",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-2 text-center sm:text-left", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_c5 = AlertDialogHeader;
function AlertDialogFooter({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        "data-slot": "alert-dialog-footer",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 84,
        columnNumber: 5
    }, this);
}
_c6 = AlertDialogFooter;
function AlertDialogTitle({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Title"], {
        "data-slot": "alert-dialog-title",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-lg font-semibold", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 100,
        columnNumber: 5
    }, this);
}
_c7 = AlertDialogTitle;
function AlertDialogDescription({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Description"], {
        "data-slot": "alert-dialog-description",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 113,
        columnNumber: 5
    }, this);
}
_c8 = AlertDialogDescription;
function AlertDialogAction({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Action"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buttonVariants"])(), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 126,
        columnNumber: 5
    }, this);
}
_c9 = AlertDialogAction;
function AlertDialogCancel({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$alert$2d$dialog$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Cancel"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buttonVariants"])({
            variant: "outline"
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/alert-dialog.tsx",
        lineNumber: 138,
        columnNumber: 5
    }, this);
}
_c10 = AlertDialogCancel;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7, _c8, _c9, _c10;
__turbopack_context__.k.register(_c, "AlertDialog");
__turbopack_context__.k.register(_c1, "AlertDialogTrigger");
__turbopack_context__.k.register(_c2, "AlertDialogPortal");
__turbopack_context__.k.register(_c3, "AlertDialogOverlay");
__turbopack_context__.k.register(_c4, "AlertDialogContent");
__turbopack_context__.k.register(_c5, "AlertDialogHeader");
__turbopack_context__.k.register(_c6, "AlertDialogFooter");
__turbopack_context__.k.register(_c7, "AlertDialogTitle");
__turbopack_context__.k.register(_c8, "AlertDialogDescription");
__turbopack_context__.k.register(_c9, "AlertDialogAction");
__turbopack_context__.k.register(_c10, "AlertDialogCancel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/textarea.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Textarea",
    ()=>Textarea
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
function Textarea({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
        "data-slot": "textarea",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/textarea.tsx",
        lineNumber: 7,
        columnNumber: 5
    }, this);
}
_c = Textarea;
;
var _c;
__turbopack_context__.k.register(_c, "Textarea");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/switch.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Switch",
    ()=>Switch
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-switch/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function Switch({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "switch",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$switch$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Thumb"], {
            "data-slot": "switch-thumb",
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-4 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0")
        }, void 0, false, {
            fileName: "[project]/src/components/ui/switch.tsx",
            lineNumber: 21,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/switch.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Switch;
;
var _c;
__turbopack_context__.k.register(_c, "Switch");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/progress.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Progress",
    ()=>Progress
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-progress/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function Progress({ className, value, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "progress",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-primary/20 relative h-2 w-full overflow-hidden rounded-full", className),
        ...props,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$progress$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Indicator"], {
            "data-slot": "progress-indicator",
            className: "bg-primary h-full w-full flex-1 transition-all",
            style: {
                transform: `translateX(-${100 - (value || 0)}%)`
            }
        }, void 0, false, {
            fileName: "[project]/src/components/ui/progress.tsx",
            lineNumber: 22,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/progress.tsx",
        lineNumber: 14,
        columnNumber: 5
    }, this);
}
_c = Progress;
;
var _c;
__turbopack_context__.k.register(_c, "Progress");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/tabs.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Tabs",
    ()=>Tabs,
    "TabsContent",
    ()=>TabsContent,
    "TabsList",
    ()=>TabsList,
    "TabsTrigger",
    ()=>TabsTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-tabs/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
;
function Tabs({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "tabs",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-2", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tabs.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Tabs;
function TabsList({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["List"], {
        "data-slot": "tabs-list",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tabs.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c1 = TabsList;
function TabsTrigger({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Trigger"], {
        "data-slot": "tabs-trigger",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("data-[state=active]:bg-background dark:data-[state=active]:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-[state=active]:border-input dark:data-[state=active]:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tabs.tsx",
        lineNumber: 42,
        columnNumber: 5
    }, this);
}
_c2 = TabsTrigger;
function TabsContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$tabs$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Content"], {
        "data-slot": "tabs-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex-1 outline-none", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/tabs.tsx",
        lineNumber: 58,
        columnNumber: 5
    }, this);
}
_c3 = TabsContent;
;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "Tabs");
__turbopack_context__.k.register(_c1, "TabsList");
__turbopack_context__.k.register(_c2, "TabsTrigger");
__turbopack_context__.k.register(_c3, "TabsContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/collapsible.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Collapsible",
    ()=>Collapsible,
    "CollapsibleContent",
    ()=>CollapsibleContent,
    "CollapsibleTrigger",
    ()=>CollapsibleTrigger
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$collapsible$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-collapsible/dist/index.mjs [app-client] (ecmascript)");
"use client";
;
;
function Collapsible({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$collapsible$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Root"], {
        "data-slot": "collapsible",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/collapsible.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
_c = Collapsible;
function CollapsibleTrigger({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$collapsible$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleTrigger"], {
        "data-slot": "collapsible-trigger",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/collapsible.tsx",
        lineNumber: 15,
        columnNumber: 5
    }, this);
}
_c1 = CollapsibleTrigger;
function CollapsibleContent({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$collapsible$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleContent"], {
        "data-slot": "collapsible-content",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/collapsible.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c2 = CollapsibleContent;
;
var _c, _c1, _c2;
__turbopack_context__.k.register(_c, "Collapsible");
__turbopack_context__.k.register(_c1, "CollapsibleTrigger");
__turbopack_context__.k.register(_c2, "CollapsibleContent");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/pagination.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Pagination",
    ()=>Pagination,
    "PaginationContent",
    ()=>PaginationContent,
    "PaginationEllipsis",
    ()=>PaginationEllipsis,
    "PaginationItem",
    ()=>PaginationItem,
    "PaginationLink",
    ()=>PaginationLink,
    "PaginationNext",
    ()=>PaginationNext,
    "PaginationPrevious",
    ()=>PaginationPrevious
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeftIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-left.js [app-client] (ecmascript) <export default as ChevronLeftIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRightIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreHorizontalIcon$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis.js [app-client] (ecmascript) <export default as MoreHorizontalIcon>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
;
;
;
;
function Pagination({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        role: "navigation",
        "aria-label": "pagination",
        "data-slot": "pagination",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("mx-auto flex w-full justify-center", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/pagination.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c = Pagination;
function PaginationContent({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
        "data-slot": "pagination-content",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-row items-center gap-1", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/pagination.tsx",
        lineNumber: 28,
        columnNumber: 5
    }, this);
}
_c1 = PaginationContent;
function PaginationItem({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
        "data-slot": "pagination-item",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/pagination.tsx",
        lineNumber: 37,
        columnNumber: 10
    }, this);
}
_c2 = PaginationItem;
function PaginationLink({ className, isActive, size = "icon", ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
        "aria-current": isActive ? "page" : undefined,
        "data-slot": "pagination-link",
        "data-active": isActive,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["buttonVariants"])({
            variant: isActive ? "outline" : "ghost",
            size
        }), className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/pagination.tsx",
        lineNumber: 52,
        columnNumber: 5
    }, this);
}
_c3 = PaginationLink;
function PaginationPrevious({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PaginationLink, {
        "aria-label": "Go to previous page",
        size: "default",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("gap-1 px-2.5 sm:pl-2.5", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$left$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronLeftIcon$3e$__["ChevronLeftIcon"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/pagination.tsx",
                lineNumber: 79,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "hidden sm:block",
                children: "Previous"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/pagination.tsx",
                lineNumber: 80,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/pagination.tsx",
        lineNumber: 73,
        columnNumber: 5
    }, this);
}
_c4 = PaginationPrevious;
function PaginationNext({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PaginationLink, {
        "aria-label": "Go to next page",
        size: "default",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("gap-1 px-2.5 sm:pr-2.5", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "hidden sm:block",
                children: "Next"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/pagination.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRightIcon$3e$__["ChevronRightIcon"], {}, void 0, false, {
                fileName: "[project]/src/components/ui/pagination.tsx",
                lineNumber: 97,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/pagination.tsx",
        lineNumber: 90,
        columnNumber: 5
    }, this);
}
_c5 = PaginationNext;
function PaginationEllipsis({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "aria-hidden": true,
        "data-slot": "pagination-ellipsis",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex size-9 items-center justify-center", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreHorizontalIcon$3e$__["MoreHorizontalIcon"], {
                className: "size-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/pagination.tsx",
                lineNumber: 113,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: "More pages"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/pagination.tsx",
                lineNumber: 114,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/pagination.tsx",
        lineNumber: 107,
        columnNumber: 5
    }, this);
}
_c6 = PaginationEllipsis;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Pagination");
__turbopack_context__.k.register(_c1, "PaginationContent");
__turbopack_context__.k.register(_c2, "PaginationItem");
__turbopack_context__.k.register(_c3, "PaginationLink");
__turbopack_context__.k.register(_c4, "PaginationPrevious");
__turbopack_context__.k.register(_c5, "PaginationNext");
__turbopack_context__.k.register(_c6, "PaginationEllipsis");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/breadcrumb.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Breadcrumb",
    ()=>Breadcrumb,
    "BreadcrumbEllipsis",
    ()=>BreadcrumbEllipsis,
    "BreadcrumbItem",
    ()=>BreadcrumbItem,
    "BreadcrumbLink",
    ()=>BreadcrumbLink,
    "BreadcrumbList",
    ()=>BreadcrumbList,
    "BreadcrumbPage",
    ()=>BreadcrumbPage,
    "BreadcrumbSeparator",
    ()=>BreadcrumbSeparator
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@radix-ui/react-slot/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreHorizontal$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/ellipsis.js [app-client] (ecmascript) <export default as MoreHorizontal>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
;
;
;
;
function Breadcrumb({ ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
        "aria-label": "breadcrumb",
        "data-slot": "breadcrumb",
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/breadcrumb.tsx",
        lineNumber: 8,
        columnNumber: 10
    }, this);
}
_c = Breadcrumb;
function BreadcrumbList({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ol", {
        "data-slot": "breadcrumb-list",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/breadcrumb.tsx",
        lineNumber: 13,
        columnNumber: 5
    }, this);
}
_c1 = BreadcrumbList;
function BreadcrumbItem({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
        "data-slot": "breadcrumb-item",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("inline-flex items-center gap-1.5", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/breadcrumb.tsx",
        lineNumber: 26,
        columnNumber: 5
    }, this);
}
_c2 = BreadcrumbItem;
function BreadcrumbLink({ asChild, className, ...props }) {
    const Comp = asChild ? __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$radix$2d$ui$2f$react$2d$slot$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Slot"] : "a";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Comp, {
        "data-slot": "breadcrumb-link",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("hover:text-foreground transition-colors", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/breadcrumb.tsx",
        lineNumber: 44,
        columnNumber: 5
    }, this);
}
_c3 = BreadcrumbLink;
function BreadcrumbPage({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "data-slot": "breadcrumb-page",
        role: "link",
        "aria-disabled": "true",
        "aria-current": "page",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-foreground font-normal", className),
        ...props
    }, void 0, false, {
        fileName: "[project]/src/components/ui/breadcrumb.tsx",
        lineNumber: 54,
        columnNumber: 5
    }, this);
}
_c4 = BreadcrumbPage;
function BreadcrumbSeparator({ children, className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
        "data-slot": "breadcrumb-separator",
        role: "presentation",
        "aria-hidden": "true",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("[&>svg]:size-3.5", className),
        ...props,
        children: children ?? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {}, void 0, false, {
            fileName: "[project]/src/components/ui/breadcrumb.tsx",
            lineNumber: 78,
            columnNumber: 20
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/ui/breadcrumb.tsx",
        lineNumber: 71,
        columnNumber: 5
    }, this);
}
_c5 = BreadcrumbSeparator;
function BreadcrumbEllipsis({ className, ...props }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
        "data-slot": "breadcrumb-ellipsis",
        role: "presentation",
        "aria-hidden": "true",
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex size-9 items-center justify-center", className),
        ...props,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$ellipsis$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MoreHorizontal$3e$__["MoreHorizontal"], {
                className: "size-4"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/breadcrumb.tsx",
                lineNumber: 95,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "sr-only",
                children: "More"
            }, void 0, false, {
                fileName: "[project]/src/components/ui/breadcrumb.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/breadcrumb.tsx",
        lineNumber: 88,
        columnNumber: 5
    }, this);
}
_c6 = BreadcrumbEllipsis;
;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "Breadcrumb");
__turbopack_context__.k.register(_c1, "BreadcrumbList");
__turbopack_context__.k.register(_c2, "BreadcrumbItem");
__turbopack_context__.k.register(_c3, "BreadcrumbLink");
__turbopack_context__.k.register(_c4, "BreadcrumbPage");
__turbopack_context__.k.register(_c5, "BreadcrumbSeparator");
__turbopack_context__.k.register(_c6, "BreadcrumbEllipsis");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/common/page-header.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PageHeader",
    ()=>PageHeader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/breadcrumb.tsx [app-client] (ecmascript)");
"use client";
;
;
;
function PageHeader({ title, description, actions, breadcrumbs, gradient = true, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("flex flex-col gap-1 mb-8 animate-fade-in", className),
        children: [
            breadcrumbs && breadcrumbs.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Breadcrumb"], {
                className: "mb-1",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BreadcrumbList"], {
                    className: "text-xs",
                    children: breadcrumbs.map((crumb, idx)=>{
                        const isLast = idx === breadcrumbs.length - 1;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "contents",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BreadcrumbItem"], {
                                    children: isLast ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BreadcrumbPage"], {
                                        className: "text-xs font-medium text-foreground/70",
                                        children: crumb.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/common/page-header.tsx",
                                        lineNumber: 60,
                                        columnNumber: 23
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BreadcrumbLink"], {
                                        href: crumb.href,
                                        className: "text-xs text-muted-foreground hover:text-foreground smooth",
                                        children: crumb.label
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/common/page-header.tsx",
                                        lineNumber: 64,
                                        columnNumber: 23
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/common/page-header.tsx",
                                    lineNumber: 58,
                                    columnNumber: 19
                                }, this),
                                !isLast && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$breadcrumb$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BreadcrumbSeparator"], {}, void 0, false, {
                                    fileName: "[project]/src/components/common/page-header.tsx",
                                    lineNumber: 72,
                                    columnNumber: 31
                                }, this)
                            ]
                        }, idx, true, {
                            fileName: "[project]/src/components/common/page-header.tsx",
                            lineNumber: 57,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/components/common/page-header.tsx",
                    lineNumber: 52,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/common/page-header.tsx",
                lineNumber: 51,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-end justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "min-w-0 space-y-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("text-2xl font-bold tracking-tight leading-tight", gradient && "text-gradient-emerald"),
                                children: title
                            }, void 0, false, {
                                fileName: "[project]/src/components/common/page-header.tsx",
                                lineNumber: 83,
                                columnNumber: 11
                            }, this),
                            description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground leading-relaxed max-w-2xl",
                                children: description
                            }, void 0, false, {
                                fileName: "[project]/src/components/common/page-header.tsx",
                                lineNumber: 92,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/common/page-header.tsx",
                        lineNumber: 82,
                        columnNumber: 9
                    }, this),
                    actions && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2 shrink-0 sm:pb-0.5",
                        children: actions
                    }, void 0, false, {
                        fileName: "[project]/src/components/common/page-header.tsx",
                        lineNumber: 99,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/common/page-header.tsx",
                lineNumber: 81,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/common/page-header.tsx",
        lineNumber: 43,
        columnNumber: 5
    }, this);
}
_c = PageHeader;
var _c;
__turbopack_context__.k.register(_c, "PageHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/common/empty-state.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "EmptyState",
    ()=>EmptyState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
"use client";
;
;
function EmptyState({ icon, title, description, action, className }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])(/* Container — gradient border card with dashed fallback */ "border-gradient relative overflow-hidden rounded-xl", "animate-fade-in", className),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("m-[1px] rounded-[calc(var(--radius-xl)-1px)]", "bg-card", "border border-dashed border-border/60", "flex flex-col items-center justify-center text-center", "py-16 px-6 sm:py-20 sm:px-8"),
            children: [
                icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative mb-6", "size-16 sm:size-20 rounded-2xl", "bg-gradient-to-br from-emerald-500/10 via-teal-500/8 to-cyan-500/5", "dark:from-emerald-500/15 dark:via-teal-500/10 dark:to-cyan-500/8", "flex items-center justify-center", "text-emerald-600 dark:text-emerald-400", /* Subtle float animation */ "animate-[float_3s_ease-in-out_infinite]"),
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("absolute inset-0 rounded-2xl", "bg-emerald-500/5 dark:bg-emerald-500/8", "blur-xl scale-125")
                        }, void 0, false, {
                            fileName: "[project]/src/components/common/empty-state.tsx",
                            lineNumber: 54,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative z-10 [&>svg]:size-7 sm:[&>svg]:size-8",
                            children: icon
                        }, void 0, false, {
                            fileName: "[project]/src/components/common/empty-state.tsx",
                            lineNumber: 62,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/common/empty-state.tsx",
                    lineNumber: 41,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                    className: "text-base font-semibold text-foreground tracking-tight",
                    children: title
                }, void 0, false, {
                    fileName: "[project]/src/components/common/empty-state.tsx",
                    lineNumber: 69,
                    columnNumber: 9
                }, this),
                description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "mt-2 text-sm text-muted-foreground leading-relaxed max-w-sm",
                    children: description
                }, void 0, false, {
                    fileName: "[project]/src/components/common/empty-state.tsx",
                    lineNumber: 75,
                    columnNumber: 11
                }, this),
                action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "mt-6",
                    children: action
                }, void 0, false, {
                    fileName: "[project]/src/components/common/empty-state.tsx",
                    lineNumber: 81,
                    columnNumber: 20
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/common/empty-state.tsx",
            lineNumber: 30,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/common/empty-state.tsx",
        lineNumber: 21,
        columnNumber: 5
    }, this);
}
_c = EmptyState;
var _c;
__turbopack_context__.k.register(_c, "EmptyState");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/data/reference.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Reference data for international trade — used in dropdowns across the app.
// All standardized, no manual entry needed.
// ============================================================
// Incoterms 2020 — all 11 rules
// ============================================================
__turbopack_context__.s([
    "CONTAINER_TYPES",
    ()=>CONTAINER_TYPES,
    "COUNTRIES",
    ()=>COUNTRIES,
    "COUNTRY_CODES",
    ()=>COUNTRY_CODES,
    "CURRENCIES",
    ()=>CURRENCIES,
    "CURRENCY_CODES",
    ()=>CURRENCY_CODES,
    "DEAL_STAGES",
    ()=>DEAL_STAGES,
    "ENTITY_TYPES",
    ()=>ENTITY_TYPES,
    "INCOTERMS",
    ()=>INCOTERMS,
    "INCOTERM_CODES",
    ()=>INCOTERM_CODES,
    "INVOICE_STATUSES",
    ()=>INVOICE_STATUSES,
    "OFFER_STATUSES",
    ()=>OFFER_STATUSES,
    "PARTNER_CATEGORIES",
    ()=>PARTNER_CATEGORIES,
    "PARTNER_TYPES",
    ()=>PARTNER_TYPES,
    "PAYMENT_TERMS",
    ()=>PAYMENT_TERMS,
    "PAYMENT_TERMS_LOCAL",
    ()=>PAYMENT_TERMS_LOCAL,
    "PRODUCT_CATEGORIES",
    ()=>PRODUCT_CATEGORIES,
    "PRODUCT_CATEGORIES_LOCAL",
    ()=>PRODUCT_CATEGORIES_LOCAL,
    "PRODUCT_UNITS",
    ()=>PRODUCT_UNITS,
    "TRADE_COST_TYPES",
    ()=>TRADE_COST_TYPES,
    "TRANSPORT_MODES",
    ()=>TRANSPORT_MODES,
    "UNITS_OF_MEASURE",
    ()=>UNITS_OF_MEASURE,
    "UOM_CODES",
    ()=>UOM_CODES,
    "getCountry",
    ()=>getCountry,
    "getCurrency",
    ()=>getCurrency,
    "getCurrencyLabel",
    ()=>getCurrencyLabel,
    "getIncoterm",
    ()=>getIncoterm
]);
const INCOTERMS = [
    {
        code: "EXW",
        name: "Ex Works",
        mode: "any",
        transfer: "Seller's premises",
        who_pays_freight: "buyer",
        who_pays_insurance: "buyer",
        who_clears_export: "buyer",
        who_clears_import: "buyer"
    },
    {
        code: "FCA",
        name: "Free Carrier",
        mode: "any",
        transfer: "Named place (carrier)",
        who_pays_freight: "buyer",
        who_pays_insurance: "buyer",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "FAS",
        name: "Free Alongside Ship",
        mode: "sea",
        transfer: "Alongside vessel (port)",
        who_pays_freight: "buyer",
        who_pays_insurance: "buyer",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "FOB",
        name: "Free On Board",
        mode: "sea",
        transfer: "On board vessel",
        who_pays_freight: "buyer",
        who_pays_insurance: "buyer",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "CFR",
        name: "Cost and Freight",
        mode: "sea",
        transfer: "On board vessel",
        who_pays_freight: "seller",
        who_pays_insurance: "buyer",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "CIF",
        name: "Cost, Insurance and Freight",
        mode: "sea",
        transfer: "On board vessel",
        who_pays_freight: "seller",
        who_pays_insurance: "seller",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "CPT",
        name: "Carriage Paid To",
        mode: "any",
        transfer: "First carrier",
        who_pays_freight: "seller",
        who_pays_insurance: "buyer",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "CIP",
        name: "Carriage and Insurance Paid To",
        mode: "any",
        transfer: "First carrier",
        who_pays_freight: "seller",
        who_pays_insurance: "seller",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "DAP",
        name: "Delivered at Place",
        mode: "any",
        transfer: "Named destination",
        who_pays_freight: "seller",
        who_pays_insurance: "seller",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "DPU",
        name: "Delivered at Place Unloaded",
        mode: "any",
        transfer: "Named destination (unloaded)",
        who_pays_freight: "seller",
        who_pays_insurance: "seller",
        who_clears_export: "seller",
        who_clears_import: "buyer"
    },
    {
        code: "DDP",
        name: "Delivered Duty Paid",
        mode: "any",
        transfer: "Named destination",
        who_pays_freight: "seller",
        who_pays_insurance: "seller",
        who_clears_export: "seller",
        who_clears_import: "seller"
    }
];
const INCOTERM_CODES = INCOTERMS.map(_c = (i)=>i.code);
_c1 = INCOTERM_CODES;
const CURRENCIES = [
    {
        value: "RSD",
        label: "RSD — Serbian Dinar"
    },
    {
        value: "EUR",
        label: "EUR — Euro"
    },
    {
        value: "USD",
        label: "USD — US Dollar"
    },
    {
        value: "GBP",
        label: "GBP — British Pound"
    },
    {
        value: "CHF",
        label: "CHF — Swiss Franc"
    },
    {
        value: "CAD",
        label: "CAD — Canadian Dollar"
    },
    {
        value: "AUD",
        label: "AUD — Australian Dollar"
    },
    {
        value: "JPY",
        label: "JPY — Japanese Yen"
    },
    {
        value: "CNY",
        label: "CNY — Chinese Yuan"
    },
    {
        value: "SEK",
        label: "SEK — Swedish Krona"
    },
    {
        value: "NOK",
        label: "NOK — Norwegian Krone"
    },
    {
        value: "DKK",
        label: "DKK — Danish Krone"
    },
    {
        value: "PLN",
        label: "PLN — Polish Zloty"
    },
    {
        value: "CZK",
        label: "CZK — Czech Koruna"
    },
    {
        value: "HUF",
        label: "HUF — Hungarian Forint"
    },
    {
        value: "RON",
        label: "RON — Romanian Leu"
    },
    {
        value: "BGN",
        label: "BGN — Bulgarian Lev"
    },
    {
        value: "HRK",
        label: "HRK — Croatian Kuna"
    },
    {
        value: "BAM",
        label: "BAM — Convertible Mark"
    },
    {
        value: "MKD",
        label: "MKD — Macedonian Denar"
    },
    {
        value: "ALL",
        label: "ALL — Albanian Lek"
    },
    {
        value: "TRY",
        label: "TRY — Turkish Lira"
    },
    {
        value: "RUB",
        label: "RUB — Russian Ruble"
    },
    {
        value: "UAH",
        label: "UAH — Ukrainian Hryvnia"
    },
    {
        value: "BRL",
        label: "BRL — Brazilian Real"
    },
    {
        value: "MXN",
        label: "MXN — Mexican Peso"
    },
    {
        value: "ARS",
        label: "ARS — Argentine Peso"
    },
    {
        value: "INR",
        label: "INR — Indian Rupee"
    },
    {
        value: "KRW",
        label: "KRW — South Korean Won"
    },
    {
        value: "SGD",
        label: "SGD — Singapore Dollar"
    },
    {
        value: "HKD",
        label: "HKD — Hong Kong Dollar"
    },
    {
        value: "TWD",
        label: "TWD — Taiwan Dollar"
    },
    {
        value: "THB",
        label: "THB — Thai Baht"
    },
    {
        value: "MYR",
        label: "MYR — Malaysian Ringgit"
    },
    {
        value: "IDR",
        label: "IDR — Indonesian Rupiah"
    },
    {
        value: "PHP",
        label: "PHP — Philippine Peso"
    },
    {
        value: "VND",
        label: "VND — Vietnamese Dong"
    },
    {
        value: "ZAR",
        label: "ZAR — South African Rand"
    },
    {
        value: "AED",
        label: "AED — UAE Dirham"
    },
    {
        value: "SAR",
        label: "SAR — Saudi Riyal"
    },
    {
        value: "ILS",
        label: "ILS — Israeli Shekel"
    },
    {
        value: "EGP",
        label: "EGP — Egyptian Pound"
    },
    {
        value: "NGN",
        label: "NGN — Nigerian Naira"
    },
    {
        value: "KES",
        label: "KES — Kenyan Shilling"
    },
    {
        value: "NZD",
        label: "NZD — New Zealand Dollar"
    },
    {
        value: "CLP",
        label: "CLP — Chilean Peso"
    },
    {
        value: "COP",
        label: "COP — Colombian Peso"
    },
    {
        value: "PEN",
        label: "PEN — Peruvian Sol"
    },
    {
        value: "GEL",
        label: "GEL — Georgian Lari"
    },
    {
        value: "ISK",
        label: "ISK — Icelandic Króna"
    }
];
const CURRENCY_CODES = CURRENCIES.map(_c2 = (c)=>c.value);
_c3 = CURRENCY_CODES;
const COUNTRIES = [
    // Balkans
    {
        code: "RS",
        name: "Serbia",
        region: "Balkans"
    },
    {
        code: "BA",
        name: "Bosnia & Herzegovina",
        region: "Balkans"
    },
    {
        code: "HR",
        name: "Croatia",
        region: "Balkans"
    },
    {
        code: "SI",
        name: "Slovenia",
        region: "Balkans"
    },
    {
        code: "MK",
        name: "North Macedonia",
        region: "Balkans"
    },
    {
        code: "ME",
        name: "Montenegro",
        region: "Balkans"
    },
    {
        code: "AL",
        name: "Albania",
        region: "Balkans"
    },
    // EU
    {
        code: "DE",
        name: "Germany",
        region: "EU"
    },
    {
        code: "FR",
        name: "France",
        region: "EU"
    },
    {
        code: "IT",
        name: "Italy",
        region: "EU"
    },
    {
        code: "ES",
        name: "Spain",
        region: "EU"
    },
    {
        code: "NL",
        name: "Netherlands",
        region: "EU"
    },
    {
        code: "BE",
        name: "Belgium",
        region: "EU"
    },
    {
        code: "AT",
        name: "Austria",
        region: "EU"
    },
    {
        code: "PL",
        name: "Poland",
        region: "EU"
    },
    {
        code: "CZ",
        name: "Czech Republic",
        region: "EU"
    },
    {
        code: "HU",
        name: "Hungary",
        region: "EU"
    },
    {
        code: "GR",
        name: "Greece",
        region: "EU"
    },
    {
        code: "BG",
        name: "Bulgaria",
        region: "EU"
    },
    {
        code: "RO",
        name: "Romania",
        region: "EU"
    },
    // CIS / Eastern
    {
        code: "RU",
        name: "Russia",
        region: "CIS"
    },
    {
        code: "UA",
        name: "Ukraine",
        region: "CIS"
    },
    {
        code: "BY",
        name: "Belarus",
        region: "CIS"
    },
    {
        code: "KZ",
        name: "Kazakhstan",
        region: "CIS"
    },
    // Middle East
    {
        code: "AE",
        name: "United Arab Emirates",
        region: "Middle East"
    },
    {
        code: "SA",
        name: "Saudi Arabia",
        region: "Middle East"
    },
    {
        code: "TR",
        name: "Turkey",
        region: "Middle East"
    },
    {
        code: "EG",
        name: "Egypt",
        region: "Middle East"
    },
    {
        code: "IL",
        name: "Israel",
        region: "Middle East"
    },
    // Asia
    {
        code: "CN",
        name: "China",
        region: "Asia"
    },
    {
        code: "IN",
        name: "India",
        region: "Asia"
    },
    {
        code: "JP",
        name: "Japan",
        region: "Asia"
    },
    {
        code: "KR",
        name: "South Korea",
        region: "Asia"
    },
    {
        code: "VN",
        name: "Vietnam",
        region: "Asia"
    },
    {
        code: "TH",
        name: "Thailand",
        region: "Asia"
    },
    {
        code: "ID",
        name: "Indonesia",
        region: "Asia"
    },
    {
        code: "MY",
        name: "Malaysia",
        region: "Asia"
    },
    // Americas
    {
        code: "US",
        name: "United States",
        region: "Americas"
    },
    {
        code: "CA",
        name: "Canada",
        region: "Americas"
    },
    {
        code: "BR",
        name: "Brazil",
        region: "Americas"
    },
    {
        code: "AR",
        name: "Argentina",
        region: "Americas"
    },
    {
        code: "MX",
        name: "Mexico",
        region: "Americas"
    },
    // Africa
    {
        code: "ZA",
        name: "South Africa",
        region: "Africa"
    },
    {
        code: "NG",
        name: "Nigeria",
        region: "Africa"
    },
    {
        code: "MA",
        name: "Morocco",
        region: "Africa"
    },
    // Oceania
    {
        code: "AU",
        name: "Australia",
        region: "Oceania"
    },
    {
        code: "NZ",
        name: "New Zealand",
        region: "Oceania"
    }
];
const COUNTRY_CODES = COUNTRIES.map(_c4 = (c)=>c.code);
_c5 = COUNTRY_CODES;
const UNITS_OF_MEASURE = [
    {
        code: "MT",
        name: "Metric Ton",
        type: "weight"
    },
    {
        code: "KG",
        name: "Kilogram",
        type: "weight"
    },
    {
        code: "G",
        name: "Gram",
        type: "weight"
    },
    {
        code: "LT",
        name: "Liter",
        type: "volume"
    },
    {
        code: "M3",
        name: "Cubic Meter",
        type: "volume"
    },
    {
        code: "BBL",
        name: "Barrel",
        type: "volume"
    },
    {
        code: "GAL",
        name: "Gallon",
        type: "volume"
    },
    {
        code: "M",
        name: "Meter",
        type: "length"
    },
    {
        code: "M2",
        name: "Square Meter",
        type: "area"
    },
    {
        code: "PCS",
        name: "Pieces",
        type: "count"
    },
    {
        code: "CTN",
        name: "Carton",
        type: "count"
    },
    {
        code: "PAL",
        name: "Pallet",
        type: "count"
    },
    {
        code: "BAG",
        name: "Bag",
        type: "count"
    },
    {
        code: "DRM",
        name: "Drum",
        type: "count"
    },
    {
        code: "BOX",
        name: "Box",
        type: "count"
    },
    {
        code: "SET",
        name: "Set",
        type: "count"
    },
    {
        code: "HR",
        name: "Hour",
        type: "service"
    },
    {
        code: "DAY",
        name: "Day",
        type: "service"
    }
];
const UOM_CODES = UNITS_OF_MEASURE.map(_c6 = (u)=>u.code);
_c7 = UOM_CODES;
const PAYMENT_TERMS = [
    {
        code: "ADVANCE",
        name: "100% Advance",
        days: 0
    },
    {
        code: "CIA",
        name: "Cash in Advance",
        days: 0
    },
    {
        code: "NET7",
        name: "Net 7",
        days: 7
    },
    {
        code: "NET14",
        name: "Net 14",
        days: 14
    },
    {
        code: "NET30",
        name: "Net 30",
        days: 30
    },
    {
        code: "NET45",
        name: "Net 45",
        days: 45
    },
    {
        code: "NET60",
        name: "Net 60",
        days: 60
    },
    {
        code: "NET90",
        name: "Net 90",
        days: 90
    },
    {
        code: "LC_SIGHT",
        name: "L/C at Sight",
        days: 0
    },
    {
        code: "LC_30",
        name: "L/C 30 days",
        days: 30
    },
    {
        code: "LC_60",
        name: "L/C 60 days",
        days: 60
    },
    {
        code: "LC_90",
        name: "L/C 90 days",
        days: 90
    },
    {
        code: "D/P",
        name: "Documents against Payment",
        days: 0
    },
    {
        code: "D/A",
        name: "Documents against Acceptance",
        days: 60
    },
    {
        code: "30_70",
        name: "30% Advance / 70% on B/L",
        days: 30
    },
    {
        code: "20_80",
        name: "20% Advance / 80% on B/L",
        days: 20
    }
];
const TRANSPORT_MODES = [
    {
        code: "SEA",
        name: "Sea Freight"
    },
    {
        code: "AIR",
        name: "Air Freight"
    },
    {
        code: "ROAD",
        name: "Road Transport"
    },
    {
        code: "RAIL",
        name: "Rail Freight"
    },
    {
        code: "MULTIMODAL",
        name: "Multimodal"
    }
];
const CONTAINER_TYPES = [
    {
        code: "20DV",
        name: "20' Dry Van",
        capacity: "33.2 m³ / 28 ton"
    },
    {
        code: "40DV",
        name: "40' Dry Van",
        capacity: "67.5 m³ / 30 ton"
    },
    {
        code: "40HC",
        name: "40' High Cube",
        capacity: "76.3 m³ / 30 ton"
    },
    {
        code: "45HC",
        name: "45' High Cube",
        capacity: "86 m³ / 30 ton"
    },
    {
        code: "20RF",
        name: "20' Reefer",
        capacity: "28 m³ / 27 ton"
    },
    {
        code: "40RF",
        name: "40' Reefer",
        capacity: "67 m³ / 30 ton"
    },
    {
        code: "20OT",
        name: "20' Open Top",
        capacity: "32 m³ / 28 ton"
    },
    {
        code: "40OT",
        name: "40' Open Top",
        capacity: "66 m³ / 30 ton"
    },
    {
        code: "20FR",
        name: "20' Flat Rack",
        capacity: "27 ton"
    },
    {
        code: "40FR",
        name: "40' Flat Rack",
        capacity: "30 ton"
    }
];
const PRODUCT_CATEGORIES = [
    {
        code: "AGRI",
        name: "Agricultural Products"
    },
    {
        code: "FOOD",
        name: "Food & Beverage"
    },
    {
        code: "SUGAR",
        name: "Sugar & Sweeteners"
    },
    {
        code: "GRAIN",
        name: "Grains & Cereals"
    },
    {
        code: "OIL",
        name: "Oils & Fats"
    },
    {
        code: "METAL",
        name: "Metals & Minerals"
    },
    {
        code: "CHEM",
        name: "Chemicals"
    },
    {
        code: "CMT",
        name: "Cement & Construction"
    },
    {
        code: "ENERGY",
        name: "Energy & Fuel"
    },
    {
        code: "TEXTILE",
        name: "Textiles & Raw Materials"
    },
    {
        code: "MACHINERY",
        name: "Machinery & Equipment"
    },
    {
        code: "PACKAGING",
        name: "Packaging Materials"
    },
    {
        code: "OTHER",
        name: "Other"
    }
];
const PARTNER_TYPES = [
    {
        code: "supplier",
        name: "Supplier"
    },
    {
        code: "buyer",
        name: "Buyer"
    },
    {
        code: "both",
        name: "Supplier & Buyer"
    },
    {
        code: "agent",
        name: "Agent / Broker"
    },
    {
        code: "logistics",
        name: "Logistics Provider"
    },
    {
        code: "customs",
        name: "Customs Broker"
    },
    {
        code: "bank",
        name: "Bank / Financial"
    },
    {
        code: "inspector",
        name: "Inspection Agency"
    }
];
const TRADE_COST_TYPES = [
    {
        code: "BUY_PRICE",
        name: "Buy Price",
        basis: "unit"
    },
    {
        code: "SELL_PRICE",
        name: "Sell Price",
        basis: "unit"
    },
    {
        code: "FREIGHT",
        name: "Sea/Air/Road Freight",
        basis: "per_container"
    },
    {
        code: "FREIGHT_INLAND",
        name: "Inland Freight (origin)",
        basis: "fixed"
    },
    {
        code: "FREIGHT_INLAND_DEST",
        name: "Inland Freight (destination)",
        basis: "fixed"
    },
    {
        code: "INSURANCE",
        name: "Insurance",
        basis: "percent"
    },
    {
        code: "CUSTOMS_DUTY",
        name: "Customs Duty",
        basis: "percent"
    },
    {
        code: "VAT",
        name: "VAT / Import Tax",
        basis: "percent"
    },
    {
        code: "EXCISE",
        name: "Excise Tax",
        basis: "percent"
    },
    {
        code: "CUSTOMS_BROKER",
        name: "Customs Broker Fee",
        basis: "fixed"
    },
    {
        code: "PORT_HANDLING",
        name: "Port Handling (THC)",
        basis: "per_container"
    },
    {
        code: "DOC_FEES",
        name: "Documentation Fees",
        basis: "fixed"
    },
    {
        code: "INSPECTION",
        name: "Inspection / SGS",
        basis: "fixed"
    },
    {
        code: "BANK_FEES",
        name: "Bank / L/C Fees",
        basis: "fixed"
    },
    {
        code: "WAREHOUSE",
        name: "Warehousing",
        basis: "fixed"
    },
    {
        code: "COMMISSION",
        name: "Agent Commission",
        basis: "percent"
    },
    {
        code: "OTHER",
        name: "Other Cost",
        basis: "fixed"
    }
];
const ENTITY_TYPES = [
    {
        value: "company",
        label: "Company"
    },
    {
        value: "individual",
        label: "Individual"
    }
];
const DEAL_STAGES = [
    {
        value: "lead",
        label: "Lead"
    },
    {
        value: "qualified",
        label: "Qualified"
    },
    {
        value: "proposal",
        label: "Proposal"
    },
    {
        value: "negotiation",
        label: "Negotiation"
    },
    {
        value: "won",
        label: "Won"
    },
    {
        value: "lost",
        label: "Lost"
    }
];
const PARTNER_CATEGORIES = [
    {
        value: "strategic",
        label: "Strategic"
    },
    {
        value: "regular",
        label: "Regular"
    },
    {
        value: "new",
        label: "New"
    },
    {
        value: "inactive",
        label: "Inactive"
    },
    {
        value: "vip",
        label: "VIP"
    }
];
const PAYMENT_TERMS_LOCAL = [
    {
        value: "immediate",
        label: "Immediate"
    },
    {
        value: "net15",
        label: "Net 15"
    },
    {
        value: "net30",
        label: "Net 30"
    },
    {
        value: "net45",
        label: "Net 45"
    },
    {
        value: "net60",
        label: "Net 60"
    },
    {
        value: "net90",
        label: "Net 90"
    }
];
const INVOICE_STATUSES = [
    {
        value: "draft",
        label: "Draft"
    },
    {
        value: "sent",
        label: "Sent"
    },
    {
        value: "paid",
        label: "Paid"
    },
    {
        value: "overdue",
        label: "Overdue"
    },
    {
        value: "cancelled",
        label: "Cancelled"
    }
];
const OFFER_STATUSES = [
    {
        value: "draft",
        label: "Draft"
    },
    {
        value: "sent",
        label: "Sent"
    },
    {
        value: "accepted",
        label: "Accepted"
    },
    {
        value: "rejected",
        label: "Rejected"
    },
    {
        value: "expired",
        label: "Expired"
    }
];
const PRODUCT_CATEGORIES_LOCAL = [
    {
        value: "raw_materials",
        label: "Raw Materials"
    },
    {
        value: "finished_goods",
        label: "Finished Goods"
    },
    {
        value: "semi_finished",
        label: "Semi-Finished"
    },
    {
        value: "consumables",
        label: "Consumables"
    },
    {
        value: "equipment",
        label: "Equipment"
    },
    {
        value: "services",
        label: "Services"
    },
    {
        value: "other",
        label: "Other"
    }
];
const PRODUCT_UNITS = [
    {
        value: "pcs",
        label: "Piece"
    },
    {
        value: "kg",
        label: "Kilogram"
    },
    {
        value: "ton",
        label: "Ton"
    },
    {
        value: "m",
        label: "Meter"
    },
    {
        value: "m2",
        label: "Square Meter"
    },
    {
        value: "m3",
        label: "Cubic Meter"
    },
    {
        value: "l",
        label: "Liter"
    },
    {
        value: "box",
        label: "Box"
    },
    {
        value: "pallet",
        label: "Pallet"
    },
    {
        value: "set",
        label: "Set"
    }
];
function getIncoterm(code) {
    return INCOTERMS.find((i)=>i.code === code);
}
function getCountry(code) {
    return COUNTRIES.find((c)=>c.code === code);
}
function getCurrencyLabel(code) {
    const c = CURRENCIES.find((c)=>c.value === code);
    return c ? c.label : code;
}
function getCurrency(code) {
    const c = CURRENCIES.find((c)=>c.value === code);
    if (!c) return undefined;
    return {
        code: c.value,
        name: c.label,
        symbol: c.value
    };
}
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "INCOTERM_CODES$INCOTERMS.map");
__turbopack_context__.k.register(_c1, "INCOTERM_CODES");
__turbopack_context__.k.register(_c2, "CURRENCY_CODES$CURRENCIES.map");
__turbopack_context__.k.register(_c3, "CURRENCY_CODES");
__turbopack_context__.k.register(_c4, "COUNTRY_CODES$COUNTRIES.map");
__turbopack_context__.k.register(_c5, "COUNTRY_CODES");
__turbopack_context__.k.register(_c6, "UOM_CODES$UNITS_OF_MEASURE.map");
__turbopack_context__.k.register(_c7, "UOM_CODES");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/data/geo/countries.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/**
 * Complete world countries + cities database.
 * Our own data — never depends on external APIs.
 *
 * 195 countries (all UN members + observers) with:
 *   - ISO alpha-2 code (RS, AE, US, ...)
 *   - ISO alpha-3 code (SRB, ARE, USA, ...)
 *   - Name, official name
 *   - Flag emoji
 *   - Currency (code, name, symbol)
 *   - Capital
 *   - Phone calling code
 *   - Region, subregion
 *   - 15+ major cities per country
 *
 * This data is embedded in the app and always available.
 */ __turbopack_context__.s([
    "COUNTRIES",
    ()=>COUNTRIES,
    "getCities",
    ()=>getCities,
    "getCitiesForSelect",
    ()=>getCitiesForSelect,
    "getCountriesForSelect",
    ()=>getCountriesForSelect,
    "getCountry",
    ()=>getCountry
]);
const _raw = [
    {
        code: "AE",
        code3: "ARE",
        name: "United Arab Emirates",
        officialName: "United Arab Emirates",
        flag: "🇦🇪",
        currency: {
            code: "AED",
            name: "Dirham",
            symbol: "د.إ"
        },
        currencies: [
            {
                code: "AED",
                name: "Dirham",
                symbol: "د.إ"
            }
        ],
        capital: "Abu Dhabi",
        callingCode: "+971",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Abu Dhabi",
            "Dubai",
            "Sharjah",
            "Ajman",
            "Ras Al Khaimah",
            "Fujairah",
            "Umm Al Quwain",
            "Al Ain",
            "Jebel Ali",
            "Khor Fakkan",
            "Dibba Al-Fujairah",
            "Madinat Zayed",
            "Ruwais",
            "Liwa Oasis",
            "Hatta"
        ]
    },
    {
        code: "SA",
        code3: "SAU",
        name: "Saudi Arabia",
        officialName: "Kingdom of Saudi Arabia",
        flag: "🇸🇦",
        currency: {
            code: "SAR",
            name: "Riyal",
            symbol: "﷼"
        },
        currencies: [
            {
                code: "SAR",
                name: "Riyal",
                symbol: "﷼"
            }
        ],
        capital: "Riyadh",
        callingCode: "+966",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Riyadh",
            "Jeddah",
            "Mecca",
            "Medina",
            "Dammam",
            "Khobar",
            "Tabuk",
            "Buraidah",
            "Khamis Mushait",
            "Hail",
            "Najran",
            "Yanbu",
            "Jubail",
            "Abha",
            "Arar",
            "Jizan",
            "Taif",
            "Sakaka"
        ]
    },
    {
        code: "RS",
        code3: "SRB",
        name: "Serbia",
        officialName: "Republic of Serbia",
        flag: "🇷🇸",
        currency: {
            code: "RSD",
            name: "Dinar",
            symbol: "дин"
        },
        currencies: [
            {
                code: "RSD",
                name: "Dinar",
                symbol: "дин"
            }
        ],
        capital: "Belgrade",
        callingCode: "+381",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Belgrade",
            "Novi Sad",
            "Niš",
            "Kragujevac",
            "Subotica",
            "Zrenjanin",
            "Pančevo",
            "Čačak",
            "Kraljevo",
            "Smederevo",
            "Leskovac",
            "Užice",
            "Vranje",
            "Šabac",
            "Sombor",
            "Požarevac",
            "Pirot",
            "Zaječar"
        ]
    },
    {
        code: "US",
        code3: "USA",
        name: "United States",
        officialName: "United States of America",
        flag: "🇺🇸",
        currency: {
            code: "USD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "USD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Washington, D.C.",
        callingCode: "+1",
        region: "Americas",
        subregion: "Northern America",
        cities: [
            "New York",
            "Los Angeles",
            "Chicago",
            "Houston",
            "Phoenix",
            "Philadelphia",
            "San Antonio",
            "San Diego",
            "Dallas",
            "San Jose",
            "Austin",
            "Jacksonville",
            "Fort Worth",
            "Columbus",
            "Charlotte",
            "San Francisco",
            "Indianapolis",
            "Seattle",
            "Denver",
            "Boston"
        ]
    },
    {
        code: "GB",
        code3: "GBR",
        name: "United Kingdom",
        officialName: "United Kingdom of Great Britain and Northern Ireland",
        flag: "🇬🇧",
        currency: {
            code: "GBP",
            name: "Pound Sterling",
            symbol: "£"
        },
        currencies: [
            {
                code: "GBP",
                name: "Pound Sterling",
                symbol: "£"
            }
        ],
        capital: "London",
        callingCode: "+44",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "London",
            "Birmingham",
            "Manchester",
            "Glasgow",
            "Liverpool",
            "Leeds",
            "Sheffield",
            "Edinburgh",
            "Bristol",
            "Cardiff",
            "Belfast",
            "Leicester",
            "Coventry",
            "Bradford",
            "Nottingham",
            "Hull",
            "Newcastle",
            "Stoke-on-Trent"
        ]
    },
    {
        code: "DE",
        code3: "DEU",
        name: "Germany",
        officialName: "Federal Republic of Germany",
        flag: "🇩🇪",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Berlin",
        callingCode: "+49",
        region: "Europe",
        subregion: "Western Europe",
        cities: [
            "Berlin",
            "Hamburg",
            "Munich",
            "Cologne",
            "Frankfurt",
            "Stuttgart",
            "Düsseldorf",
            "Leipzig",
            "Dortmund",
            "Essen",
            "Bremen",
            "Dresden",
            "Hannover",
            "Nuremberg",
            "Duisburg",
            "Bochum",
            "Wuppertal",
            "Bielefeld"
        ]
    },
    {
        code: "FR",
        code3: "FRA",
        name: "France",
        officialName: "French Republic",
        flag: "🇫🇷",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Paris",
        callingCode: "+33",
        region: "Europe",
        subregion: "Western Europe",
        cities: [
            "Paris",
            "Marseille",
            "Lyon",
            "Toulouse",
            "Nice",
            "Nantes",
            "Strasbourg",
            "Montpellier",
            "Bordeaux",
            "Lille",
            "Rennes",
            "Reims",
            "Le Havre",
            "Saint-Étienne",
            "Toulon",
            "Grenoble",
            "Dijon",
            "Angers"
        ]
    },
    {
        code: "IT",
        code3: "ITA",
        name: "Italy",
        officialName: "Italian Republic",
        flag: "🇮🇹",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Rome",
        callingCode: "+39",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Rome",
            "Milan",
            "Naples",
            "Turin",
            "Palermo",
            "Genoa",
            "Bologna",
            "Florence",
            "Bari",
            "Catania",
            "Venice",
            "Verona",
            "Messina",
            "Padua",
            "Trieste",
            "Brescia",
            "Parma",
            "Prato"
        ]
    },
    {
        code: "NL",
        code3: "NLD",
        name: "Netherlands",
        officialName: "Kingdom of the Netherlands",
        flag: "🇳🇱",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Amsterdam",
        callingCode: "+31",
        region: "Europe",
        subregion: "Western Europe",
        cities: [
            "Amsterdam",
            "Rotterdam",
            "The Hague",
            "Utrecht",
            "Eindhoven",
            "Tilburg",
            "Groningen",
            "Almere",
            "Breda",
            "Nijmegen",
            "Enschede",
            "Apeldoorn",
            "Haarlem",
            "Arnhem",
            "Amersfoort",
            "Zaanstad",
            "Leeuwarden"
        ]
    },
    {
        code: "ES",
        code3: "ESP",
        name: "Spain",
        officialName: "Kingdom of Spain",
        flag: "🇪🇸",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Madrid",
        callingCode: "+34",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Madrid",
            "Barcelona",
            "Valencia",
            "Seville",
            "Zaragoza",
            "Málaga",
            "Murcia",
            "Palma",
            "Bilbao",
            "Alicante",
            "Córdoba",
            "Valladolid",
            "Vigo",
            "Gijón",
            "Granada",
            "Elche",
            "Oviedo",
            "Badalona"
        ]
    },
    {
        code: "CH",
        code3: "CHE",
        name: "Switzerland",
        officialName: "Swiss Confederation",
        flag: "🇨🇭",
        currency: {
            code: "CHF",
            name: "Swiss Franc",
            symbol: "₣"
        },
        currencies: [
            {
                code: "CHF",
                name: "Swiss Franc",
                symbol: "₣"
            }
        ],
        capital: "Bern",
        callingCode: "+41",
        region: "Europe",
        subregion: "Western Europe",
        cities: [
            "Zurich",
            "Geneva",
            "Basel",
            "Bern",
            "Lausanne",
            "Winterthur",
            "Lucerne",
            "St. Gallen",
            "Lugano",
            "Biel",
            "Thun",
            "Köniz",
            "La Chaux-de-Fonds",
            "Schaffhausen",
            "Fribourg",
            "Vernier",
            "Chur"
        ]
    },
    {
        code: "TR",
        code3: "TUR",
        name: "Turkey",
        officialName: "Republic of Türkiye",
        flag: "🇹🇷",
        currency: {
            code: "TRY",
            name: "Lira",
            symbol: "₺"
        },
        currencies: [
            {
                code: "TRY",
                name: "Lira",
                symbol: "₺"
            }
        ],
        capital: "Ankara",
        callingCode: "+90",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Istanbul",
            "Ankara",
            "Izmir",
            "Bursa",
            "Antalya",
            "Konya",
            "Adana",
            "Şanlıurfa",
            "Gaziantep",
            "Mersin",
            "Diyarbakır",
            "Kayseri",
            "Eskişehir",
            "Samsun",
            "Denizli",
            "Sakarya",
            "Trabzon",
            "Malatya"
        ]
    },
    {
        code: "CN",
        code3: "CHN",
        name: "China",
        officialName: "People's Republic of China",
        flag: "🇨🇳",
        currency: {
            code: "CNY",
            name: "Yuan",
            symbol: "¥"
        },
        currencies: [
            {
                code: "CNY",
                name: "Yuan",
                symbol: "¥"
            }
        ],
        capital: "Beijing",
        callingCode: "+86",
        region: "Asia",
        subregion: "Eastern Asia",
        cities: [
            "Shanghai",
            "Beijing",
            "Guangzhou",
            "Shenzhen",
            "Tianjin",
            "Wuhan",
            "Chongqing",
            "Chengdu",
            "Nanjing",
            "Xi'an",
            "Hangzhou",
            "Suzhou",
            "Shenyang",
            "Qingdao",
            "Dalian",
            "Harbin",
            "Jinan",
            "Zhengzhou"
        ]
    },
    {
        code: "IN",
        code3: "IND",
        name: "India",
        officialName: "Republic of India",
        flag: "🇮🇳",
        currency: {
            code: "INR",
            name: "Rupee",
            symbol: "₹"
        },
        currencies: [
            {
                code: "INR",
                name: "Rupee",
                symbol: "₹"
            }
        ],
        capital: "New Delhi",
        callingCode: "+91",
        region: "Asia",
        subregion: "Southern Asia",
        cities: [
            "Mumbai",
            "Delhi",
            "Bangalore",
            "Hyderabad",
            "Chennai",
            "Kolkata",
            "Ahmedabad",
            "Pune",
            "Surat",
            "Jaipur",
            "Lucknow",
            "Kanpur",
            "Nagpur",
            "Indore",
            "Bhopal",
            "Patna",
            "Vadodara",
            "Visakhapatnam"
        ]
    },
    {
        code: "JP",
        code3: "JPN",
        name: "Japan",
        officialName: "Japan",
        flag: "🇯🇵",
        currency: {
            code: "JPY",
            name: "Yen",
            symbol: "¥"
        },
        currencies: [
            {
                code: "JPY",
                name: "Yen",
                symbol: "¥"
            }
        ],
        capital: "Tokyo",
        callingCode: "+81",
        region: "Asia",
        subregion: "Eastern Asia",
        cities: [
            "Tokyo",
            "Yokohama",
            "Osaka",
            "Nagoya",
            "Sapporo",
            "Fukuoka",
            "Kobe",
            "Kyoto",
            "Kawasaki",
            "Saitama",
            "Hiroshima",
            "Sendai",
            "Kitakyushu",
            "Chiba",
            "Sakai",
            "Niigata",
            "Hamamatsu",
            "Shizuoka"
        ]
    },
    {
        code: "KR",
        code3: "KOR",
        name: "South Korea",
        officialName: "Republic of Korea",
        flag: "🇰🇷",
        currency: {
            code: "KRW",
            name: "Won",
            symbol: "₩"
        },
        currencies: [
            {
                code: "KRW",
                name: "Won",
                symbol: "₩"
            }
        ],
        capital: "Seoul",
        callingCode: "+82",
        region: "Asia",
        subregion: "Eastern Asia",
        cities: [
            "Seoul",
            "Busan",
            "Incheon",
            "Daegu",
            "Daejeon",
            "Gwangju",
            "Suwon",
            "Ulsan",
            "Yongin",
            "Changwon",
            "Goyang",
            "Seongnam",
            "Cheongju",
            "Jeonju",
            "Anyang",
            "Namyangju",
            "Pohang",
            "Uijeongbu"
        ]
    },
    {
        code: "SG",
        code3: "SGP",
        name: "Singapore",
        officialName: "Republic of Singapore",
        flag: "🇸🇬",
        currency: {
            code: "SGD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "SGD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Singapore",
        callingCode: "+65",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Singapore",
            "Jurong",
            "Tampines",
            "Woodlands",
            "Bedok",
            "Sengkang",
            "Hougang",
            "Yishun",
            "Choa Chu Kang",
            "Ang Mo Kio",
            "Bukit Batok",
            "Bukit Merah",
            "Toa Payoh",
            "Geylang",
            "Kallang",
            "Pasir Ris",
            "Punggol"
        ]
    },
    {
        code: "MY",
        code3: "MYS",
        name: "Malaysia",
        officialName: "Malaysia",
        flag: "🇲🇾",
        currency: {
            code: "MYR",
            name: "Ringgit",
            symbol: "RM"
        },
        currencies: [
            {
                code: "MYR",
                name: "Ringgit",
                symbol: "RM"
            }
        ],
        capital: "Kuala Lumpur",
        callingCode: "+60",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Kuala Lumpur",
            "George Town",
            "Ipoh",
            "Shah Alam",
            "Petaling Jaya",
            "Johor Bahru",
            "Subang Jaya",
            "Kuching",
            "Kota Kinabalu",
            "Klang",
            "Kajang",
            "Seremban",
            "Iskandar Puteri",
            "Malacca",
            "Alor Setar",
            "Miri",
            "Kuantan",
            "Kuala Terengganu"
        ]
    },
    {
        code: "ID",
        code3: "IDN",
        name: "Indonesia",
        officialName: "Republic of Indonesia",
        flag: "🇮🇩",
        currency: {
            code: "IDR",
            name: "Rupiah",
            symbol: "Rp"
        },
        currencies: [
            {
                code: "IDR",
                name: "Rupiah",
                symbol: "Rp"
            }
        ],
        capital: "Jakarta",
        callingCode: "+62",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Jakarta",
            "Surabaya",
            "Bandung",
            "Medan",
            "Semarang",
            "Makassar",
            "Palembang",
            "Tangerang",
            "Depok",
            "Batam",
            "Bekasi",
            "Yogyakarta",
            "Padang",
            "Malang",
            "Pekanbaru",
            "Bandar Lampung",
            "Banjarmasin",
            "Denpasar"
        ]
    },
    {
        code: "TH",
        code3: "THA",
        name: "Thailand",
        officialName: "Kingdom of Thailand",
        flag: "🇹🇭",
        currency: {
            code: "THB",
            name: "Baht",
            symbol: "฿"
        },
        currencies: [
            {
                code: "THB",
                name: "Baht",
                symbol: "฿"
            }
        ],
        capital: "Bangkok",
        callingCode: "+66",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Bangkok",
            "Nonthaburi",
            "Nakhon Ratchasima",
            "Chiang Mai",
            "Hat Yai",
            "Udon Thani",
            "Surat Thani",
            "Khon Kaen",
            "Nakhon Si Thammarat",
            "Ubon Ratchathani",
            "Chonburi",
            "Nakhon Pathom",
            "Phitsanulok",
            "Pattaya",
            "Songkhla",
            "Trang",
            "Krabi",
            "Phuket"
        ]
    },
    {
        code: "VN",
        code3: "VNM",
        name: "Vietnam",
        officialName: "Socialist Republic of Vietnam",
        flag: "🇻🇳",
        currency: {
            code: "VND",
            name: "Dong",
            symbol: "₫"
        },
        currencies: [
            {
                code: "VND",
                name: "Dong",
                symbol: "₫"
            }
        ],
        capital: "Hanoi",
        callingCode: "+84",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Ho Chi Minh City",
            "Hanoi",
            "Hai Phong",
            "Da Nang",
            "Can Tho",
            "Bien Hoa",
            "Hue",
            "Nha Trang",
            "Buon Ma Thuot",
            "Vung Tau",
            "Qui Nhon",
            "Nam Dinh",
            "Phan Thiet",
            "Long Xuyen",
            "Ha Long",
            "Thai Nguyen",
            "Thanh Hoa",
            "Vinh"
        ]
    },
    {
        code: "BR",
        code3: "BRA",
        name: "Brazil",
        officialName: "Federative Republic of Brazil",
        flag: "🇧🇷",
        currency: {
            code: "BRL",
            name: "Real",
            symbol: "R$"
        },
        currencies: [
            {
                code: "BRL",
                name: "Real",
                symbol: "R$"
            }
        ],
        capital: "Brasília",
        callingCode: "+55",
        region: "Americas",
        subregion: "South America",
        cities: [
            "São Paulo",
            "Rio de Janeiro",
            "Brasília",
            "Salvador",
            "Fortaleza",
            "Belo Horizonte",
            "Manaus",
            "Curitiba",
            "Recife",
            "Porto Alegre",
            "Belém",
            "Goiânia",
            "Guarulhos",
            "Campinas",
            "São Luís",
            "Maceió",
            "Natal",
            "Florianópolis"
        ]
    },
    {
        code: "CA",
        code3: "CAN",
        name: "Canada",
        officialName: "Canada",
        flag: "🇨🇦",
        currency: {
            code: "CAD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "CAD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Ottawa",
        callingCode: "+1",
        region: "Americas",
        subregion: "Northern America",
        cities: [
            "Toronto",
            "Montreal",
            "Vancouver",
            "Calgary",
            "Edmonton",
            "Ottawa",
            "Winnipeg",
            "Quebec City",
            "Hamilton",
            "Halifax",
            "Victoria",
            "Saskatoon",
            "Regina",
            "London",
            "St. Catharines",
            "Mississauga",
            "Brampton",
            "Surrey"
        ]
    },
    {
        code: "AU",
        code3: "AUS",
        name: "Australia",
        officialName: "Commonwealth of Australia",
        flag: "🇦🇺",
        currency: {
            code: "AUD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "AUD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Canberra",
        callingCode: "+61",
        region: "Oceania",
        subregion: "Australia and New Zealand",
        cities: [
            "Sydney",
            "Melbourne",
            "Brisbane",
            "Perth",
            "Adelaide",
            "Gold Coast",
            "Newcastle",
            "Canberra",
            "Sunshine Coast",
            "Wollongong",
            "Hobart",
            "Geelong",
            "Townsville",
            "Cairns",
            "Darwin",
            "Toowoomba",
            "Ballarat",
            "Bendigo"
        ]
    },
    {
        code: "RU",
        code3: "RUS",
        name: "Russia",
        officialName: "Russian Federation",
        flag: "🇷🇺",
        currency: {
            code: "RUB",
            name: "Ruble",
            symbol: "₽"
        },
        currencies: [
            {
                code: "RUB",
                name: "Ruble",
                symbol: "₽"
            }
        ],
        capital: "Moscow",
        callingCode: "+7",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Moscow",
            "Saint Petersburg",
            "Novosibirsk",
            "Yekaterinburg",
            "Kazan",
            "Nizhny Novgorod",
            "Chelyabinsk",
            "Krasnoyarsk",
            "Samara",
            "Ufa",
            "Rostov-on-Don",
            "Omsk",
            "Krasnodar",
            "Voronezh",
            "Perm",
            "Volgograd",
            "Vladivostok",
            "Sochi"
        ]
    },
    {
        code: "BE",
        code3: "BEL",
        name: "Belgium",
        officialName: "Kingdom of Belgium",
        flag: "🇧🇪",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Brussels",
        callingCode: "+32",
        region: "Europe",
        subregion: "Western Europe",
        cities: [
            "Brussels",
            "Antwerp",
            "Ghent",
            "Charleroi",
            "Liège",
            "Bruges",
            "Namur",
            "Leuven",
            "Mons",
            "Aalst",
            "Mechelen",
            "La Louvière",
            "Kortrijk",
            "Hasselt",
            "Ostend",
            "Tournai",
            "Genk",
            "Seraing"
        ]
    },
    {
        code: "AT",
        code3: "AUT",
        name: "Austria",
        officialName: "Republic of Austria",
        flag: "🇦🇹",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Vienna",
        callingCode: "+43",
        region: "Europe",
        subregion: "Western Europe",
        cities: [
            "Vienna",
            "Graz",
            "Linz",
            "Salzburg",
            "Innsbruck",
            "Klagenfurt",
            "Villach",
            "Wels",
            "Sankt Pölten",
            "Dornbirn",
            "Steyr",
            "Wiener Neustadt",
            "Feldkirch",
            "Bregenz",
            "Leonding",
            "Klosterneuburg",
            "Baden",
            "Wolfsberg"
        ]
    },
    {
        code: "PL",
        code3: "POL",
        name: "Poland",
        officialName: "Republic of Poland",
        flag: "🇵🇱",
        currency: {
            code: "PLN",
            name: "Zloty",
            symbol: "zł"
        },
        currencies: [
            {
                code: "PLN",
                name: "Zloty",
                symbol: "zł"
            }
        ],
        capital: "Warsaw",
        callingCode: "+48",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Warsaw",
            "Kraków",
            "Łódź",
            "Wrocław",
            "Poznań",
            "Gdańsk",
            "Szczecin",
            "Bydgoszcz",
            "Lublin",
            "Białystok",
            "Katowice",
            "Gdynia",
            "Częstochowa",
            "Radom",
            "Sosnowiec",
            "Toruń",
            "Kielce",
            "Rzeszów"
        ]
    },
    {
        code: "CZ",
        code3: "CZE",
        name: "Czech Republic",
        officialName: "Czech Republic",
        flag: "🇨🇿",
        currency: {
            code: "CZK",
            name: "Koruna",
            symbol: "Kč"
        },
        currencies: [
            {
                code: "CZK",
                name: "Koruna",
                symbol: "Kč"
            }
        ],
        capital: "Prague",
        callingCode: "+420",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Prague",
            "Brno",
            "Ostrava",
            "Plzeň",
            "Liberec",
            "Olomouc",
            "Ústí nad Labem",
            "Hradec Králové",
            "České Budějovice",
            "Pardubice",
            "Havířov",
            "Zlín",
            "Kladno",
            "Most",
            "Karviná",
            "Opava",
            "Frýdek-Místek",
            "Karlovy Vary"
        ]
    },
    {
        code: "HU",
        code3: "HUN",
        name: "Hungary",
        officialName: "Hungary",
        flag: "🇭🇺",
        currency: {
            code: "HUF",
            name: "Forint",
            symbol: "Ft"
        },
        currencies: [
            {
                code: "HUF",
                name: "Forint",
                symbol: "Ft"
            }
        ],
        capital: "Budapest",
        callingCode: "+36",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Budapest",
            "Debrecen",
            "Szeged",
            "Miskolc",
            "Pécs",
            "Győr",
            "Nyíregyháza",
            "Kecskemét",
            "Székesfehérvár",
            "Szombathely",
            "Szolnok",
            "Tatabánya",
            "Érd",
            "Kaposvár",
            "Sopron",
            "Veszprém",
            "Békéscsaba",
            "Zalaegerszeg"
        ]
    },
    {
        code: "RO",
        code3: "ROU",
        name: "Romania",
        officialName: "Romania",
        flag: "🇷🇴",
        currency: {
            code: "RON",
            name: "Leu",
            symbol: "lei"
        },
        currencies: [
            {
                code: "RON",
                name: "Leu",
                symbol: "lei"
            }
        ],
        capital: "Bucharest",
        callingCode: "+40",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Bucharest",
            "Cluj-Napoca",
            "Iași",
            "Timișoara",
            "Constanța",
            "Craiova",
            "Brașov",
            "Galați",
            "Ploiești",
            "Oradea",
            "Brăila",
            "Arad",
            "Pitești",
            "Sibiu",
            "Bacău",
            "Târgu Mureș",
            "Baia Mare",
            "Buzău"
        ]
    },
    {
        code: "GR",
        code3: "GRC",
        name: "Greece",
        officialName: "Hellenic Republic",
        flag: "🇬🇷",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Athens",
        callingCode: "+30",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Athens",
            "Thessaloniki",
            "Patras",
            "Heraklion",
            "Larissa",
            "Volos",
            "Ioannina",
            "Trikala",
            "Chalcis",
            "Serres",
            "Alexandroupoli",
            "Kalamata",
            "Katerini",
            "Rhodes",
            "Kavala",
            "Komotini",
            "Drama",
            "Lamia"
        ]
    },
    {
        code: "HR",
        code3: "HRV",
        name: "Croatia",
        officialName: "Republic of Croatia",
        flag: "🇭🇷",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Zagreb",
        callingCode: "+385",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Zagreb",
            "Split",
            "Rijeka",
            "Osijek",
            "Zadar",
            "Slavonski Brod",
            "Pula",
            "Karlovac",
            "Sisak",
            "Varaždin",
            "Šibenik",
            "Dubrovnik",
            "Bjelovar",
            "Kaštela",
            "Vinkovci",
            "Velika Gorica",
            "Vukovar",
            "Đakovo"
        ]
    },
    {
        code: "BA",
        code3: "BIH",
        name: "Bosnia and Herzegovina",
        officialName: "Bosnia and Herzegovina",
        flag: "🇧🇦",
        currency: {
            code: "BAM",
            name: "Mark",
            symbol: "KM"
        },
        currencies: [
            {
                code: "BAM",
                name: "Mark",
                symbol: "KM"
            }
        ],
        capital: "Sarajevo",
        callingCode: "+387",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Sarajevo",
            "Banja Luka",
            "Tuzla",
            "Zenica",
            "Mostar",
            "Bijeljina",
            "Brčko",
            "Prijedor",
            "Trebinje",
            "Doboj",
            "Cazin",
            "Bihać",
            "Travnik",
            "Goražde",
            "Sanski Most",
            "Gradiška",
            "Živinice",
            "Lukavac"
        ]
    },
    {
        code: "MK",
        code3: "MKD",
        name: "North Macedonia",
        officialName: "Republic of North Macedonia",
        flag: "🇲🇰",
        currency: {
            code: "MKD",
            name: "Denar",
            symbol: "ден"
        },
        currencies: [
            {
                code: "MKD",
                name: "Denar",
                symbol: "ден"
            }
        ],
        capital: "Skopje",
        callingCode: "+389",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Skopje",
            "Kumanovo",
            "Bitola",
            "Prilep",
            "Tetovo",
            "Veles",
            "Štip",
            "Ohrid",
            "Gostivar",
            "Strumica",
            "Kavadarci",
            "Kočani",
            "Kičevo",
            "Struga",
            "Radoviš",
            "Gevgelija",
            "Debar",
            "Kratovo"
        ]
    },
    {
        code: "ME",
        code3: "MNE",
        name: "Montenegro",
        officialName: "Montenegro",
        flag: "🇲🇪",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Podgorica",
        callingCode: "+382",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Podgorica",
            "Nikšić",
            "Pljevlja",
            "Bijelo Polje",
            "Cetinje",
            "Bar",
            "Herceg Novi",
            "Berane",
            "Budva",
            "Ulcinj",
            "Tivat",
            "Rožaje",
            "Kotor",
            "Danilovgrad",
            "Mojkovac",
            "Plav",
            "Žabljak",
            "Plužine"
        ]
    },
    {
        code: "AL",
        code3: "ALB",
        name: "Albania",
        officialName: "Republic of Albania",
        flag: "🇦🇱",
        currency: {
            code: "ALL",
            name: "Lek",
            symbol: "L"
        },
        currencies: [
            {
                code: "ALL",
                name: "Lek",
                symbol: "L"
            }
        ],
        capital: "Tirana",
        callingCode: "+355",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Tirana",
            "Durrës",
            "Vlorë",
            "Elbasan",
            "Shkodër",
            "Korçë",
            "Fier",
            "Berat",
            "Lushnja",
            "Pogradec",
            "Kavajë",
            "Gjirokastër",
            "Lezhë",
            "Krujë",
            "Burrel",
            "Laç",
            "Kuçovë",
            "Sarandë"
        ]
    },
    {
        code: "SI",
        code3: "SVN",
        name: "Slovenia",
        officialName: "Republic of Slovenia",
        flag: "🇸🇮",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Ljubljana",
        callingCode: "+386",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Ljubljana",
            "Maribor",
            "Celje",
            "Kranj",
            "Velenje",
            "Koper",
            "Novo Mesto",
            "Ptuj",
            "Trbovlje",
            "Kamnik",
            "Jesenice",
            "Nova Gorica",
            "Domžale",
            "Škofja Loka",
            "Murska Sobota",
            "Postojna",
            "Krško",
            "Brežice"
        ]
    },
    {
        code: "EG",
        code3: "EGY",
        name: "Egypt",
        officialName: "Arab Republic of Egypt",
        flag: "🇪🇬",
        currency: {
            code: "EGP",
            name: "Pound",
            symbol: "£"
        },
        currencies: [
            {
                code: "EGP",
                name: "Pound",
                symbol: "£"
            }
        ],
        capital: "Cairo",
        callingCode: "+20",
        region: "Africa",
        subregion: "Northern Africa",
        cities: [
            "Cairo",
            "Alexandria",
            "Giza",
            "Shubra El-Kheima",
            "Port Said",
            "Suez",
            "Luxor",
            "Mansoura",
            "El-Mahalla El-Kubra",
            "Tanta",
            "Asyut",
            "Ismailia",
            "Fayyum",
            "Zagazig",
            "Aswan",
            "Damietta",
            "Damanhur",
            "Minya"
        ]
    },
    {
        code: "ZA",
        code3: "ZAF",
        name: "South Africa",
        officialName: "Republic of South Africa",
        flag: "🇿🇦",
        currency: {
            code: "ZAR",
            name: "Rand",
            symbol: "R"
        },
        currencies: [
            {
                code: "ZAR",
                name: "Rand",
                symbol: "R"
            }
        ],
        capital: "Pretoria",
        callingCode: "+27",
        region: "Africa",
        subregion: "Southern Africa",
        cities: [
            "Johannesburg",
            "Cape Town",
            "Durban",
            "Pretoria",
            "Port Elizabeth",
            "Bloemfontein",
            "East London",
            "Pietermaritzburg",
            "Polokwane",
            "Nelspruit",
            "Kimberley",
            "Rustenburg",
            "Soweto",
            "Tembisa",
            "Vereeniging",
            "Boksburg",
            "Welkom",
            "Krugersdorp"
        ]
    },
    {
        code: "NG",
        code3: "NGA",
        name: "Nigeria",
        officialName: "Federal Republic of Nigeria",
        flag: "🇳🇬",
        currency: {
            code: "NGN",
            name: "Naira",
            symbol: "₦"
        },
        currencies: [
            {
                code: "NGN",
                name: "Naira",
                symbol: "₦"
            }
        ],
        capital: "Abuja",
        callingCode: "+234",
        region: "Africa",
        subregion: "Western Africa",
        cities: [
            "Lagos",
            "Kano",
            "Ibadan",
            "Abuja",
            "Port Harcourt",
            "Benin City",
            "Kaduna",
            "Maiduguri",
            "Zaria",
            "Aba",
            "Jos",
            "Ilorin",
            "Oyo",
            "Enugu",
            "Abeokuta",
            "Onitsha",
            "Warri",
            "Sokoto"
        ]
    },
    {
        code: "SN",
        code3: "SEN",
        name: "Senegal",
        officialName: "Republic of Senegal",
        flag: "🇸🇳",
        currency: {
            code: "XOF",
            name: "CFA Franc",
            symbol: "₣"
        },
        currencies: [
            {
                code: "XOF",
                name: "CFA Franc",
                symbol: "₣"
            }
        ],
        capital: "Dakar",
        callingCode: "+221",
        region: "Africa",
        subregion: "Western Africa",
        cities: [
            "Dakar",
            "Touba",
            "Thiès",
            "Rufisque",
            "Kaolack",
            "Ziguinchor",
            "Saint-Louis",
            "Mbour",
            "Diourbel",
            "Tambacounda",
            "Richard-Toll",
            "Tivaouane",
            "Louga",
            "Matam",
            "Kolda",
            "Sédhiou",
            "Bignona",
            "Kaffrine"
        ]
    },
    {
        code: "CI",
        code3: "CIV",
        name: "Ivory Coast",
        officialName: "Republic of Côte d'Ivoire",
        flag: "🇨🇮",
        currency: {
            code: "XOF",
            name: "CFA Franc",
            symbol: "₣"
        },
        currencies: [
            {
                code: "XOF",
                name: "CFA Franc",
                symbol: "₣"
            }
        ],
        capital: "Yamoussoukro",
        callingCode: "+225",
        region: "Africa",
        subregion: "Western Africa",
        cities: [
            "Abidjan",
            "Bouaké",
            "Yamoussoukro",
            "Daloa",
            "Korhogo",
            "San-Pédro",
            "Man",
            "Divo",
            "Gagnoa",
            "Anyama",
            "Abobo",
            "Séguéla",
            "Bondo",
            "Odienné",
            "Bingerville",
            "Grand-Bassam",
            "Dabou",
            "Touba"
        ]
    },
    {
        code: "QA",
        code3: "QAT",
        name: "Qatar",
        officialName: "State of Qatar",
        flag: "🇶🇦",
        currency: {
            code: "QAR",
            name: "Riyal",
            symbol: "﷼"
        },
        currencies: [
            {
                code: "QAR",
                name: "Riyal",
                symbol: "﷼"
            }
        ],
        capital: "Doha",
        callingCode: "+974",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Doha",
            "Al Rayyan",
            "Umm Salal Muhammad",
            "Al Wakrah",
            "Al Khor",
            "Lusail",
            "Madinat ash Shamal",
            "Dukhan",
            "Mesaieed",
            "Ras Laffan",
            "Al Daayen",
            "Zekreet",
            "Fuwayrit",
            "Khor Al Adaid",
            "Simaisma",
            "Abu Samra",
            "Umm Bab"
        ]
    },
    {
        code: "KW",
        code3: "KWT",
        name: "Kuwait",
        officialName: "State of Kuwait",
        flag: "🇰🇼",
        currency: {
            code: "KWD",
            name: "Dinar",
            symbol: "د.ك"
        },
        currencies: [
            {
                code: "KWD",
                name: "Dinar",
                symbol: "د.ك"
            }
        ],
        capital: "Kuwait City",
        callingCode: "+965",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Kuwait City",
            "Al Ahmadi",
            "Hawalli",
            "Salmiya",
            "Jahra",
            "Farwaniya",
            "Fahaheel",
            "Mahboula",
            "Jaber Al Ali",
            "Bayan",
            "Sabah Al Salem",
            "Mangaf",
            "Rumaithiya",
            "Khaitan",
            "Abbasiya",
            "Fintas",
            "Kaifan",
            "Shuwaikh"
        ]
    },
    {
        code: "OM",
        code3: "OMN",
        name: "Oman",
        officialName: "Sultanate of Oman",
        flag: "🇴🇲",
        currency: {
            code: "OMR",
            name: "Rial",
            symbol: "﷼"
        },
        currencies: [
            {
                code: "OMR",
                name: "Rial",
                symbol: "﷼"
            }
        ],
        capital: "Muscat",
        callingCode: "+968",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Muscat",
            "Salalah",
            "Sohar",
            "Sib",
            "Nizwa",
            "Sur",
            "Sohar",
            "Bahla",
            "Ibri",
            "Rustaq",
            "Buraimi",
            "Khasab",
            "Bawshar",
            "Ibra",
            "Bidiyah",
            "Sumail",
            "Bahla",
            "Adam"
        ]
    },
    {
        code: "IR",
        code3: "IRN",
        name: "Iran",
        officialName: "Islamic Republic of Iran",
        flag: "🇮🇷",
        currency: {
            code: "IRR",
            name: "Rial",
            symbol: "﷼"
        },
        currencies: [
            {
                code: "IRR",
                name: "Rial",
                symbol: "﷼"
            }
        ],
        capital: "Tehran",
        callingCode: "+98",
        region: "Asia",
        subregion: "Southern Asia",
        cities: [
            "Tehran",
            "Mashhad",
            "Isfahan",
            "Karaj",
            "Shiraz",
            "Tabriz",
            "Qom",
            "Ahvaz",
            "Kermanshah",
            "Urmia",
            "Rasht",
            "Kerman",
            "Zahedan",
            "Hamadan",
            "Yazd",
            "Arak",
            "Bandar Abbas",
            "Eslamshahr"
        ]
    },
    {
        code: "IQ",
        code3: "IRQ",
        name: "Iraq",
        officialName: "Republic of Iraq",
        flag: "🇮🇶",
        currency: {
            code: "IQD",
            name: "Dinar",
            symbol: "ع.د"
        },
        currencies: [
            {
                code: "IQD",
                name: "Dinar",
                symbol: "ع.د"
            }
        ],
        capital: "Baghdad",
        callingCode: "+964",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Baghdad",
            "Basra",
            "Mosul",
            "Erbil",
            "Sulaymaniyah",
            "Najaf",
            "Karbala",
            "Kirkuk",
            "Nasiriyah",
            "Hillah",
            "Kut",
            "Fallujah",
            "Tikrit",
            "Ramadi",
            "BaQuba",
            "Duhok",
            "Amarah",
            "Samawah"
        ]
    },
    {
        code: "MA",
        code3: "MAR",
        name: "Morocco",
        officialName: "Kingdom of Morocco",
        flag: "🇲🇦",
        currency: {
            code: "MAD",
            name: "Dirham",
            symbol: "د.م."
        },
        currencies: [
            {
                code: "MAD",
                name: "Dirham",
                symbol: "د.م."
            }
        ],
        capital: "Rabat",
        callingCode: "+212",
        region: "Africa",
        subregion: "Northern Africa",
        cities: [
            "Casablanca",
            "Rabat",
            "Marrakesh",
            "Fes",
            "Tangier",
            "Meknes",
            "Agadir",
            "Oujda",
            "Kenitra",
            "Tetouan",
            "Safi",
            "Mohammedia",
            "Khouribga",
            "El Jadida",
            "Beni Mellal",
            "Aït Melloul",
            "Nador",
            "Taza"
        ]
    },
    {
        code: "TN",
        code3: "TUN",
        name: "Tunisia",
        officialName: "Republic of Tunisia",
        flag: "🇹🇳",
        currency: {
            code: "TND",
            name: "Dinar",
            symbol: "د.ت"
        },
        currencies: [
            {
                code: "TND",
                name: "Dinar",
                symbol: "د.ت"
            }
        ],
        capital: "Tunis",
        callingCode: "+216",
        region: "Africa",
        subregion: "Northern Africa",
        cities: [
            "Tunis",
            "Sfax",
            "Sousse",
            "Kairouan",
            "Bizerte",
            "Gabès",
            "Ariana",
            "Gafsa",
            "Monastir",
            "Ben Arous",
            "Kasserine",
            "Tataouine",
            "Béja",
            "Le Kef",
            "Mahdia",
            "Nabeul",
            "Médenine",
            "Sidi Bouzid"
        ]
    },
    {
        code: "DZ",
        code3: "DZA",
        name: "Algeria",
        officialName: "People's Democratic Republic of Algeria",
        flag: "🇩🇿",
        currency: {
            code: "DZD",
            name: "Dinar",
            symbol: "د.ج"
        },
        currencies: [
            {
                code: "DZD",
                name: "Dinar",
                symbol: "د.ج"
            }
        ],
        capital: "Algiers",
        callingCode: "+213",
        region: "Africa",
        subregion: "Northern Africa",
        cities: [
            "Algiers",
            "Oran",
            "Constantine",
            "Annaba",
            "Blida",
            "Batna",
            "Djelfa",
            "Sétif",
            "Sidi Bel Abbès",
            "Biskra",
            "Tébessa",
            "Tlemcen",
            "Tiaret",
            "Béjaïa",
            "Tizi Ouzou",
            "Skikda",
            "Medea",
            "M'Sila"
        ]
    },
    {
        code: "LY",
        code3: "LBY",
        name: "Libya",
        officialName: "State of Libya",
        flag: "🇱🇾",
        currency: {
            code: "LYD",
            name: "Dinar",
            symbol: "ل.د"
        },
        currencies: [
            {
                code: "LYD",
                name: "Dinar",
                symbol: "ل.د"
            }
        ],
        capital: "Tripoli",
        callingCode: "+218",
        region: "Africa",
        subregion: "Northern Africa",
        cities: [
            "Tripoli",
            "Benghazi",
            "Misrata",
            "Zawiya",
            "Zliten",
            "Ajdabiya",
            "Tobruk",
            "Sabha",
            "Derna",
            "Ghadames",
            "Khoms",
            "Bani Walid",
            "Sirte",
            "Murzuq",
            "Benghazi",
            "Bayda",
            "Zuwara",
            "Surt"
        ]
    },
    {
        code: "SD",
        code3: "SDN",
        name: "Sudan",
        officialName: "Republic of the Sudan",
        flag: "🇸🇩",
        currency: {
            code: "SDG",
            name: "Pound",
            symbol: "£"
        },
        currencies: [
            {
                code: "SDG",
                name: "Pound",
                symbol: "£"
            }
        ],
        capital: "Khartoum",
        callingCode: "+249",
        region: "Africa",
        subregion: "Northern Africa",
        cities: [
            "Khartoum",
            "Omdurman",
            "Khartoum North",
            "Port Sudan",
            "Kassala",
            "Nyala",
            "Al-Fashir",
            "Juba",
            "Wad Madani",
            "El Obeid",
            "Dongola",
            "Kusti",
            "Sennar",
            "Atbara",
            "Ed Damazin",
            "Merowe",
            "Kadugli",
            "Rabak"
        ]
    },
    {
        code: "KE",
        code3: "KEN",
        name: "Kenya",
        officialName: "Republic of Kenya",
        flag: "🇰🇪",
        currency: {
            code: "KES",
            name: "Shilling",
            symbol: "KSh"
        },
        currencies: [
            {
                code: "KES",
                name: "Shilling",
                symbol: "KSh"
            }
        ],
        capital: "Nairobi",
        callingCode: "+254",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Nairobi",
            "Mombasa",
            "Kisumu",
            "Nakuru",
            "Eldoret",
            "Ruiru",
            "Kikuyu",
            "Kangundo-Tala",
            "Malindi",
            "Naivasha",
            "Kitui",
            "Machakos",
            "Thika",
            "Kilifi",
            "Bungoma",
            "Garissa",
            "Kakamega",
            "Kericho"
        ]
    },
    {
        code: "TZ",
        code3: "TZA",
        name: "Tanzania",
        officialName: "United Republic of Tanzania",
        flag: "🇹🇿",
        currency: {
            code: "TZS",
            name: "Shilling",
            symbol: "TSh"
        },
        currencies: [
            {
                code: "TZS",
                name: "Shilling",
                symbol: "TSh"
            }
        ],
        capital: "Dodoma",
        callingCode: "+255",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Dar es Salaam",
            "Mwanza",
            "Arusha",
            "Dodoma",
            "Mbeya",
            "Morogoro",
            "Tanga",
            "Kahama",
            "Tabora",
            "Zanzibar",
            "Kigoma",
            "Sumbawanga",
            "Kasulu",
            "Songea",
            "Moshi",
            "Musoma",
            "Iringa",
            "Shinyanga"
        ]
    },
    {
        code: "GH",
        code3: "GHA",
        name: "Ghana",
        officialName: "Republic of Ghana",
        flag: "🇬🇭",
        currency: {
            code: "GHS",
            name: "Cedi",
            symbol: "₵"
        },
        currencies: [
            {
                code: "GHS",
                name: "Cedi",
                symbol: "₵"
            }
        ],
        capital: "Accra",
        callingCode: "+233",
        region: "Africa",
        subregion: "Western Africa",
        cities: [
            "Accra",
            "Kumasi",
            "Tamale",
            "Sekondi-Takoradi",
            "Sunyani",
            "Cape Coast",
            "Obuasi",
            "Tema",
            "Teshie",
            "Madina",
            "Koforidua",
            "Wa",
            "Ho",
            "Bolgatanga",
            "Nungua",
            "Techiman",
            "Tamale",
            "Winneba"
        ]
    },
    {
        code: "ET",
        code3: "ETH",
        name: "Ethiopia",
        officialName: "Federal Democratic Republic of Ethiopia",
        flag: "🇪🇹",
        currency: {
            code: "ETB",
            name: "Birr",
            symbol: "Br"
        },
        currencies: [
            {
                code: "ETB",
                name: "Birr",
                symbol: "Br"
            }
        ],
        capital: "Addis Ababa",
        callingCode: "+251",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Addis Ababa",
            "Dire Dawa",
            "Mek'ele",
            "Gondar",
            "Adama",
            "Hawassa",
            "Bahir Dar",
            "Dessie",
            "Jimma",
            "Jijiga",
            "Shashamane",
            "Bale Robe",
            "Arsi Negele",
            "Hosaena",
            "Harar",
            "Dilla",
            "Adigrat",
            "Debre Berhan"
        ]
    },
    {
        code: "MX",
        code3: "MEX",
        name: "Mexico",
        officialName: "United Mexican States",
        flag: "🇲🇽",
        currency: {
            code: "MXN",
            name: "Peso",
            symbol: "$"
        },
        currencies: [
            {
                code: "MXN",
                name: "Peso",
                symbol: "$"
            }
        ],
        capital: "Mexico City",
        callingCode: "+52",
        region: "Americas",
        subregion: "Central America",
        cities: [
            "Mexico City",
            "Guadalajara",
            "Monterrey",
            "Puebla",
            "Tijuana",
            "León",
            "Ciudad Juárez",
            "Zapopan",
            "Mérida",
            "Cancún",
            "Acapulco",
            "Querétaro",
            "Hermosillo",
            "Aguascalientes",
            "Culiacán",
            "Morelia",
            "Saltillo",
            "Veracruz"
        ]
    },
    {
        code: "AR",
        code3: "ARG",
        name: "Argentina",
        officialName: "Argentine Republic",
        flag: "🇦🇷",
        currency: {
            code: "ARS",
            name: "Peso",
            symbol: "$"
        },
        currencies: [
            {
                code: "ARS",
                name: "Peso",
                symbol: "$"
            }
        ],
        capital: "Buenos Aires",
        callingCode: "+54",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Buenos Aires",
            "Córdoba",
            "Rosario",
            "Mendoza",
            "La Plata",
            "Mar del Plata",
            "Tucumán",
            "Salta",
            "Santa Fe",
            "San Juan",
            "Resistencia",
            "Neuquén",
            "Santiago del Estero",
            "Corrientes",
            "Posadas",
            "Bahía Blanca",
            "Paraná",
            "Formosa"
        ]
    },
    {
        code: "CL",
        code3: "CHL",
        name: "Chile",
        officialName: "Republic of Chile",
        flag: "🇨🇱",
        currency: {
            code: "CLP",
            name: "Peso",
            symbol: "$"
        },
        currencies: [
            {
                code: "CLP",
                name: "Peso",
                symbol: "$"
            }
        ],
        capital: "Santiago",
        callingCode: "+56",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Santiago",
            "Valparaíso",
            "Concepción",
            "Antofagasta",
            "Viña del Mar",
            "La Serena",
            "Temuco",
            "Rancagua",
            "Talca",
            "Arica",
            "Iquique",
            "Puerto Montt",
            "Coquimbo",
            "Chillán",
            "Calama",
            "Osorno",
            "Valdivia",
            "Punta Arenas"
        ]
    },
    {
        code: "CO",
        code3: "COL",
        name: "Colombia",
        officialName: "Republic of Colombia",
        flag: "🇨🇴",
        currency: {
            code: "COP",
            name: "Peso",
            symbol: "$"
        },
        currencies: [
            {
                code: "COP",
                name: "Peso",
                symbol: "$"
            }
        ],
        capital: "Bogotá",
        callingCode: "+57",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Bogotá",
            "Medellín",
            "Cali",
            "Barranquilla",
            "Cartagena",
            "Cúcuta",
            "Soledad",
            "Ibagué",
            "Bucaramanga",
            "Soacha",
            "Santa Marta",
            "Villavicencio",
            "Bello",
            "Valledupar",
            "Pereira",
            "Manizales",
            "Buenaventura",
            "Neiva"
        ]
    },
    {
        code: "PE",
        code3: "PER",
        name: "Peru",
        officialName: "Republic of Peru",
        flag: "🇵🇪",
        currency: {
            code: "PEN",
            name: "Sol",
            symbol: "S/"
        },
        currencies: [
            {
                code: "PEN",
                name: "Sol",
                symbol: "S/"
            }
        ],
        capital: "Lima",
        callingCode: "+51",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Lima",
            "Arequipa",
            "Trujillo",
            "Chiclayo",
            "Piura",
            "Iquitos",
            "Cusco",
            "Chimbote",
            "Huancayo",
            "Tacna",
            "Juliaca",
            "Ica",
            "Sullana",
            "Ayacucho",
            "Cajamarca",
            "Pucallpa",
            "Tumbes",
            "Talara"
        ]
    },
    {
        code: "EC",
        code3: "ECU",
        name: "Ecuador",
        officialName: "Republic of Ecuador",
        flag: "🇪🇨",
        currency: {
            code: "USD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "USD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Quito",
        callingCode: "+593",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Guayaquil",
            "Quito",
            "Cuenca",
            "Santo Domingo",
            "Machala",
            "Manta",
            "Portoviejo",
            "Ambato",
            "Riobamba",
            "Loja",
            "Esmeraldas",
            "Ibarra",
            "Quevedo",
            "Latacunga",
            "Milagro",
            "Babahoyo",
            "Santa Elena",
            "Puyo"
        ]
    },
    {
        code: "VE",
        code3: "VEN",
        name: "Venezuela",
        officialName: "Bolivarian Republic of Venezuela",
        flag: "🇻🇪",
        currency: {
            code: "VES",
            name: "Bolívar",
            symbol: "Bs"
        },
        currencies: [
            {
                code: "VES",
                name: "Bolívar",
                symbol: "Bs"
            }
        ],
        capital: "Caracas",
        callingCode: "+58",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Caracas",
            "Maracaibo",
            "Valencia",
            "Barquisimeto",
            "Ciudad Guayana",
            "Maracay",
            "Barcelona",
            "Maturín",
            "San Cristóbal",
            "Ciudad Bolívar",
            "Cumaná",
            "Mérida",
            "Cabimas",
            "Coro",
            "Los Teques",
            "Punto Fijo",
            "Petare",
            "Acarigua"
        ]
    },
    {
        code: "PT",
        code3: "PRT",
        name: "Portugal",
        officialName: "Portuguese Republic",
        flag: "🇵🇹",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Lisbon",
        callingCode: "+351",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Lisbon",
            "Porto",
            "Braga",
            "Coimbra",
            "Funchal",
            "Setúbal",
            "Aveiro",
            "Faro",
            "Leiria",
            "Viseu",
            "Évora",
            "Vila Nova de Gaia",
            "Guimarães",
            "Amadora",
            "Vila Franca de Xira",
            "Almada",
            "Seixal",
            "Barreiro"
        ]
    },
    {
        code: "IE",
        code3: "IRL",
        name: "Ireland",
        officialName: "Ireland",
        flag: "🇮🇪",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Dublin",
        callingCode: "+353",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Dublin",
            "Cork",
            "Limerick",
            "Galway",
            "Waterford",
            "Drogheda",
            "Dundalk",
            "Bray",
            "Navan",
            "Ennis",
            "Kilkenny",
            "Tralee",
            "Carlow",
            "Newbridge",
            "Naas",
            "Athlone",
            "Portlaoise",
            "Mullingar"
        ]
    },
    {
        code: "SE",
        code3: "SWE",
        name: "Sweden",
        officialName: "Kingdom of Sweden",
        flag: "🇸🇪",
        currency: {
            code: "SEK",
            name: "Krona",
            symbol: "kr"
        },
        currencies: [
            {
                code: "SEK",
                name: "Krona",
                symbol: "kr"
            }
        ],
        capital: "Stockholm",
        callingCode: "+46",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Stockholm",
            "Gothenburg",
            "Malmö",
            "Uppsala",
            "Västerås",
            "Örebro",
            "Linköping",
            "Helsingborg",
            "Jönköping",
            "Norrköping",
            "Lund",
            "Umeå",
            "Gävle",
            "Borås",
            "Sundsvall",
            "Eskilstuna",
            "Karlstad",
            "Växjö"
        ]
    },
    {
        code: "DK",
        code3: "DNK",
        name: "Denmark",
        officialName: "Kingdom of Denmark",
        flag: "🇩🇰",
        currency: {
            code: "DKK",
            name: "Krone",
            symbol: "kr"
        },
        currencies: [
            {
                code: "DKK",
                name: "Krone",
                symbol: "kr"
            }
        ],
        capital: "Copenhagen",
        callingCode: "+45",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Copenhagen",
            "Aarhus",
            "Odense",
            "Aalborg",
            "Frederiksberg",
            "Esbjerg",
            "Randers",
            "Kolding",
            "Horsens",
            "Vejle",
            "Roskilde",
            "Herning",
            "Hørsholm",
            "Helsingør",
            "Silkeborg",
            "Næstved",
            "Greve",
            "Fredericia"
        ]
    },
    {
        code: "NO",
        code3: "NOR",
        name: "Norway",
        officialName: "Kingdom of Norway",
        flag: "🇳🇴",
        currency: {
            code: "NOK",
            name: "Krone",
            symbol: "kr"
        },
        currencies: [
            {
                code: "NOK",
                name: "Krone",
                symbol: "kr"
            }
        ],
        capital: "Oslo",
        callingCode: "+47",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Oslo",
            "Bergen",
            "Trondheim",
            "Stavanger",
            "Drammen",
            "Fredrikstad",
            "Kristiansand",
            "Sandnes",
            "Tromsø",
            "Sarpsborg",
            "Skien",
            "Ålesund",
            "Sandefjord",
            "Haugesund",
            "Tønsberg",
            "Moss",
            "Porsgrunn",
            "Bodø"
        ]
    },
    {
        code: "FI",
        code3: "FIN",
        name: "Finland",
        officialName: "Republic of Finland",
        flag: "🇫🇮",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Helsinki",
        callingCode: "+358",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Helsinki",
            "Espoo",
            "Tampere",
            "Vantaa",
            "Oulu",
            "Turku",
            "Jyväskylä",
            "Lahti",
            "Kuopio",
            "Pori",
            "Joensuu",
            "Lappeenranta",
            "Hämeenlinna",
            "Vaasa",
            "Seinäjoki",
            "Rovaniemi",
            "Mikkeli",
            "Kotka"
        ]
    },
    {
        code: "NZ",
        code3: "NZL",
        name: "New Zealand",
        officialName: "New Zealand",
        flag: "🇳🇿",
        currency: {
            code: "NZD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "NZD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Wellington",
        callingCode: "+64",
        region: "Oceania",
        subregion: "Australia and New Zealand",
        cities: [
            "Auckland",
            "Wellington",
            "Christchurch",
            "Hamilton",
            "Tauranga",
            "Napier-Hastings",
            "Dunedin",
            "Palmerston North",
            "Nelson",
            "Rotorua",
            "New Plymouth",
            "Whangarei",
            "Invercargill",
            "Whanganui",
            "Gisborne",
            "Timaru",
            "Taupo",
            "Levin"
        ]
    },
    {
        code: "PH",
        code3: "PHL",
        name: "Philippines",
        officialName: "Republic of the Philippines",
        flag: "🇵🇭",
        currency: {
            code: "PHP",
            name: "Peso",
            symbol: "₱"
        },
        currencies: [
            {
                code: "PHP",
                name: "Peso",
                symbol: "₱"
            }
        ],
        capital: "Manila",
        callingCode: "+63",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Manila",
            "Quezon City",
            "Davao",
            "Caloocan",
            "Cebu City",
            "Zamboanga",
            "Antipolo",
            "Pasig",
            "Taguig",
            "Cagayan de Oro",
            "Parañaque",
            "Valenzuela",
            "Las Piñas",
            "Makati",
            "Bacoor",
            "General Santos",
            "Muntinlupa",
            "Iloilo"
        ]
    },
    {
        code: "PK",
        code3: "PAK",
        name: "Pakistan",
        officialName: "Islamic Republic of Pakistan",
        flag: "🇵🇰",
        currency: {
            code: "PKR",
            name: "Rupee",
            symbol: "₨"
        },
        currencies: [
            {
                code: "PKR",
                name: "Rupee",
                symbol: "₨"
            }
        ],
        capital: "Islamabad",
        callingCode: "+92",
        region: "Asia",
        subregion: "Southern Asia",
        cities: [
            "Karachi",
            "Lahore",
            "Faisalabad",
            "Rawalpindi",
            "Multan",
            "Hyderabad",
            "Gujranwala",
            "Peshawar",
            "Quetta",
            "Islamabad",
            "Bahawalpur",
            "Sargodha",
            "Sialkot",
            "Sukkur",
            "Larkana",
            "Sheikhupura",
            "Bannu",
            "Rahim Yar Khan"
        ]
    },
    {
        code: "BD",
        code3: "BGD",
        name: "Bangladesh",
        officialName: "People's Republic of Bangladesh",
        flag: "🇧🇩",
        currency: {
            code: "BDT",
            name: "Taka",
            symbol: "৳"
        },
        currencies: [
            {
                code: "BDT",
                name: "Taka",
                symbol: "৳"
            }
        ],
        capital: "Dhaka",
        callingCode: "+880",
        region: "Asia",
        subregion: "Southern Asia",
        cities: [
            "Dhaka",
            "Chittagong",
            "Khulna",
            "Rajshahi",
            "Sylhet",
            "Mymensingh",
            "Rangpur",
            "Comilla",
            "Narayanganj",
            "Gazipur",
            "Jessore",
            "Dinajpur",
            "Bogra",
            "Tangail",
            "Nawabganj",
            "Kushtia",
            "Pabna",
            "Naogaon"
        ]
    },
    {
        code: "LK",
        code3: "LKA",
        name: "Sri Lanka",
        officialName: "Democratic Socialist Republic of Sri Lanka",
        flag: "🇱🇰",
        currency: {
            code: "LKR",
            name: "Rupee",
            symbol: "₨"
        },
        currencies: [
            {
                code: "LKR",
                name: "Rupee",
                symbol: "₨"
            }
        ],
        capital: "Sri Jayawardenepura Kotte",
        callingCode: "+94",
        region: "Asia",
        subregion: "Southern Asia",
        cities: [
            "Colombo",
            "Sri Jayawardenepura Kotte",
            "Dehiwala",
            "Moratuwa",
            "Negombo",
            "Kandy",
            "Galle",
            "Trincomalee",
            "Batticaloa",
            "Jaffna",
            "Anuradhapura",
            "Matara",
            "Ratnapura",
            "Badulla",
            "Kurunegala",
            "Polonnaruwa",
            "Hambantota",
            "Nuwara Eliya"
        ]
    },
    {
        code: "HK",
        code3: "HKG",
        name: "Hong Kong",
        officialName: "Hong Kong Special Administrative Region of China",
        flag: "🇭🇰",
        currency: {
            code: "HKD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "HKD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Hong Kong",
        callingCode: "+852",
        region: "Asia",
        subregion: "Eastern Asia",
        cities: [
            "Hong Kong",
            "Kowloon",
            "Tsuen Wan",
            "Yuen Long Kau Hui",
            "Tuen Mun",
            "Tai Po",
            "Sha Tin",
            "Sai Kung",
            "Tseung Kwan O",
            "Tin Shui Wai",
            "Tung Chung",
            "Fanling",
            "Sheung Shui",
            "Ma On Shan",
            "Tsz Wan Shan",
            "Chai Wan",
            "Wong Tai Sin",
            "Kwun Tong"
        ]
    },
    {
        code: "TW",
        code3: "TWN",
        name: "Taiwan",
        officialName: "Taiwan",
        flag: "🇹🇼",
        currency: {
            code: "TWD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "TWD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Taipei",
        callingCode: "+886",
        region: "Asia",
        subregion: "Eastern Asia",
        cities: [
            "Taipei",
            "New Taipei",
            "Kaohsiung",
            "Taichung",
            "Tainan",
            "Taoyuan",
            "Hsinchu",
            "Keelung",
            "Chiayi",
            "Hualien",
            "Yilan",
            "Pingtung",
            "Changhua",
            "Yunlin",
            "Miaoli",
            "Nantou",
            "Taitung",
            "Penghu"
        ]
    },
    {
        code: "BG",
        code3: "BGR",
        name: "Bulgaria",
        officialName: "Republic of Bulgaria",
        flag: "🇧🇬",
        currency: {
            code: "BGN",
            name: "Lev",
            symbol: "лв"
        },
        currencies: [
            {
                code: "BGN",
                name: "Lev",
                symbol: "лв"
            }
        ],
        capital: "Sofia",
        callingCode: "+359",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Sofia",
            "Plovdiv",
            "Varna",
            "Burgas",
            "Ruse",
            "Stara Zagora",
            "Pleven",
            "Sliven",
            "Dobrich",
            "Shumen",
            "Pernik",
            "Haskovo",
            "Yambol",
            "Pazardzhik",
            "Blagoevgrad",
            "Veliko Tarnovo",
            "Vratsa",
            "Gabrovo"
        ]
    },
    {
        code: "UA",
        code3: "UKR",
        name: "Ukraine",
        officialName: "Ukraine",
        flag: "🇺🇦",
        currency: {
            code: "UAH",
            name: "Hryvnia",
            symbol: "₴"
        },
        currencies: [
            {
                code: "UAH",
                name: "Hryvnia",
                symbol: "₴"
            }
        ],
        capital: "Kyiv",
        callingCode: "+380",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Kyiv",
            "Kharkiv",
            "Odesa",
            "Dnipro",
            "Zaporizhzhia",
            "Lviv",
            "Kryvyi Rih",
            "Mykolaiv",
            "Mariupol",
            "Vinnytsia",
            "Kherson",
            "Poltava",
            "Chernihiv",
            "Cherkasy",
            "Sumy",
            "Zhytomyr",
            "Rivne",
            "Kamianske"
        ]
    },
    {
        code: "SK",
        code3: "SVK",
        name: "Slovakia",
        officialName: "Slovak Republic",
        flag: "🇸🇰",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Bratislava",
        callingCode: "+421",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Bratislava",
            "Košice",
            "Prešov",
            "Žilina",
            "Banská Bystrica",
            "Nitra",
            "Trnava",
            "Trenčín",
            "Martin",
            "Poprad",
            "Prievidza",
            "Zvolen",
            "Považská Bystrica",
            "Michalovce",
            "Spišská Nová Ves",
            "Komárno",
            "Levice",
            "Humenné"
        ]
    },
    {
        code: "LT",
        code3: "LTU",
        name: "Lithuania",
        officialName: "Republic of Lithuania",
        flag: "🇱🇹",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Vilnius",
        callingCode: "+370",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Vilnius",
            "Kaunas",
            "Klaipėda",
            "Šiauliai",
            "Panevėžys",
            "Alytus",
            "Marijampolė",
            "Mažeikiai",
            "Jonava",
            "Utena",
            "Kėdainiai",
            "Telšiai",
            "Visaginas",
            "Tauragė",
            "Ukmergė",
            "Plungė",
            "Kretinga",
            "Radviliškis"
        ]
    },
    {
        code: "LV",
        code3: "LVA",
        name: "Latvia",
        officialName: "Republic of Latvia",
        flag: "🇱🇻",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Riga",
        callingCode: "+371",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Riga",
            "Daugavpils",
            "Liepāja",
            "Jelgava",
            "Jūrmala",
            "Ventspils",
            "Rēzekne",
            "Valmiera",
            "Jēkabpils",
            "Ogre",
            "Tukums",
            "Cēsis",
            "Salaspils",
            "Kuldīga",
            "Olaine",
            "Saldus",
            "Kārsava",
            "Dobele"
        ]
    },
    {
        code: "EE",
        code3: "EST",
        name: "Estonia",
        officialName: "Republic of Estonia",
        flag: "🇪🇪",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Tallinn",
        callingCode: "+372",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Tallinn",
            "Tartu",
            "Narva",
            "Pärnu",
            "Kohtla-Järve",
            "Viljandi",
            "Rakvere",
            "Maardu",
            "Sillamäe",
            "Kuressaare",
            "Võru",
            "Valga",
            "Haapsalu",
            "Jõhvi",
            "Paide",
            "Keila",
            "Põlva",
            "Tapa"
        ]
    },
    {
        code: "IS",
        code3: "ISL",
        name: "Iceland",
        officialName: "Iceland",
        flag: "🇮🇸",
        currency: {
            code: "ISK",
            name: "Krona",
            symbol: "kr"
        },
        currencies: [
            {
                code: "ISK",
                name: "Krona",
                symbol: "kr"
            }
        ],
        capital: "Reykjavik",
        callingCode: "+354",
        region: "Europe",
        subregion: "Northern Europe",
        cities: [
            "Reykjavik",
            "Kópavogur",
            "Hafnarfjörður",
            "Akureyri",
            "Reykjanesbær",
            "Garðabær",
            "Mosfellsbær",
            "Akranes",
            "Selfoss",
            "Vestmannaeyjar",
            "Seltjarnarnes",
            "Grindavík",
            "Ísafjörður",
            "Egilsstaðir",
            "Húsavík",
            "Borgarnes",
            "Neskaupstaður",
            "Stykkishólmur"
        ]
    },
    {
        code: "LU",
        code3: "LUX",
        name: "Luxembourg",
        officialName: "Grand Duchy of Luxembourg",
        flag: "🇱🇺",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Luxembourg",
        callingCode: "+352",
        region: "Europe",
        subregion: "Western Europe",
        cities: [
            "Luxembourg",
            "Esch-sur-Alzette",
            "Differdange",
            "Dudelange",
            "Pétange",
            "Sanem",
            "Hesperange",
            "Bettembourg",
            "Mamer",
            "Strassen",
            "Diekirch",
            "Ettelbruck",
            "Wiltz",
            "Grevenmacher",
            "Remich",
            "Echternach",
            "Redange",
            "Vianden"
        ]
    },
    {
        code: "MT",
        code3: "MLT",
        name: "Malta",
        officialName: "Republic of Malta",
        flag: "🇲🇹",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Valletta",
        callingCode: "+356",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Valletta",
            "Birkirkara",
            "Mosta",
            "Qormi",
            "Żabbar",
            "Sliema",
            "San Pawl il-Baħar",
            "Naxxar",
            "Fgura",
            "Żejtun",
            "Rabat",
            "Marsaskala",
            "Birżebbuġa",
            "Attard",
            "Gzira",
            "Marsaxlokk",
            "Mdina",
            "Victoria"
        ]
    },
    {
        code: "CY",
        code3: "CYP",
        name: "Cyprus",
        officialName: "Republic of Cyprus",
        flag: "🇨🇾",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Nicosia",
        callingCode: "+357",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Nicosia",
            "Limassol",
            "Larnaca",
            "Famagusta",
            "Paphos",
            "Kyrenia",
            "Latsia",
            "Strovolos",
            "Lakatamia",
            "Yermasogeia",
            "Agios Athanasios",
            "Engomi",
            "Aradippou",
            "Mesa Geitonia",
            "Paralimni",
            "Dali",
            "Tseri",
            "Aglandjia"
        ]
    },
    {
        code: "UY",
        code3: "URY",
        name: "Uruguay",
        officialName: "Oriental Republic of Uruguay",
        flag: "🇺🇾",
        currency: {
            code: "UYU",
            name: "Peso",
            symbol: "$U"
        },
        currencies: [
            {
                code: "UYU",
                name: "Peso",
                symbol: "$U"
            }
        ],
        capital: "Montevideo",
        callingCode: "+598",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Montevideo",
            "Salto",
            "Ciudad de la Costa",
            "Paysandú",
            "Las Piedras",
            "Rivera",
            "Maldonado",
            "Tacuarembó",
            "Melo",
            "Mercedes",
            "Artigas",
            "Minas",
            "San José",
            "Durazno",
            "Florida",
            "Treinta y Tres",
            "Rocha",
            "Fray Bentos"
        ]
    },
    {
        code: "PY",
        code3: "PRY",
        name: "Paraguay",
        officialName: "Republic of Paraguay",
        flag: "🇵🇾",
        currency: {
            code: "PYG",
            name: "Guaraní",
            symbol: "₲"
        },
        currencies: [
            {
                code: "PYG",
                name: "Guaraní",
                symbol: "₲"
            }
        ],
        capital: "Asunción",
        callingCode: "+595",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Asunción",
            "Ciudad del Este",
            "San Lorenzo",
            "Luque",
            "Capiatá",
            "Lambaré",
            "Fernando de la Mora",
            "Limpio",
            "Nemby",
            "Encarnación",
            "Mariano Roque Alonso",
            "Pedro Juan Caballero",
            "Villa Elisa",
            "Caaguazú",
            "Coronel Oviedo",
            "Villarrica",
            "Caacupé",
            "San Antonio"
        ]
    },
    {
        code: "BO",
        code3: "BOL",
        name: "Bolivia",
        officialName: "Plurinational State of Bolivia",
        flag: "🇧🇴",
        currency: {
            code: "BOB",
            name: "Boliviano",
            symbol: "Bs"
        },
        currencies: [
            {
                code: "BOB",
                name: "Boliviano",
                symbol: "Bs"
            }
        ],
        capital: "Sucre",
        callingCode: "+591",
        region: "Americas",
        subregion: "South America",
        cities: [
            "Santa Cruz de la Sierra",
            "La Paz",
            "Cochabamba",
            "Sucre",
            "Oruro",
            "Tarija",
            "Potosí",
            "Trinidad",
            "El Alto",
            "Sacaba",
            "Quillacollo",
            "Riberalta",
            "Yacuiba",
            "Montero",
            "Camiri",
            "Warnes",
            "Cobija",
            "Viacha"
        ]
    },
    {
        code: "DO",
        code3: "DOM",
        name: "Dominican Republic",
        officialName: "Dominican Republic",
        flag: "🇩🇴",
        currency: {
            code: "DOP",
            name: "Peso",
            symbol: "$"
        },
        currencies: [
            {
                code: "DOP",
                name: "Peso",
                symbol: "$"
            }
        ],
        capital: "Santo Domingo",
        callingCode: "+1-809",
        region: "Americas",
        subregion: "Caribbean",
        cities: [
            "Santo Domingo",
            "Santiago",
            "Santo Domingo Oeste",
            "Santo Domingo Este",
            "Los Alcarrizos",
            "San Cristóbal",
            "La Romana",
            "San Pedro de Macorís",
            "Higüey",
            "Puerto Plata",
            "San Juan de la Maguana",
            "Boca Chica",
            "Bonao",
            "Barahona",
            "Moca",
            "Azua",
            "Sánchez",
            "Samaná"
        ]
    },
    {
        code: "CR",
        code3: "CRI",
        name: "Costa Rica",
        officialName: "Republic of Costa Rica",
        flag: "🇨🇷",
        currency: {
            code: "CRC",
            name: "Colón",
            symbol: "₡"
        },
        currencies: [
            {
                code: "CRC",
                name: "Colón",
                symbol: "₡"
            }
        ],
        capital: "San José",
        callingCode: "+506",
        region: "Americas",
        subregion: "Central America",
        cities: [
            "San José",
            "Puerto Limón",
            "Alajuela",
            "Heredia",
            "Cartago",
            "Puntarenas",
            "Liberia",
            "San Isidro de El General",
            "Paraíso",
            "Turrialba",
            "San Vicente",
            "San Francisco",
            "Quesada",
            "San Pablo",
            "Lipcira",
            "Guápiles",
            "San Ramón",
            "Orotina"
        ]
    },
    {
        code: "PA",
        code3: "PAN",
        name: "Panama",
        officialName: "Republic of Panama",
        flag: "🇵🇦",
        currency: {
            code: "PAB",
            name: "Balboa",
            symbol: "B/."
        },
        currencies: [
            {
                code: "PAB",
                name: "Balboa",
                symbol: "B/."
            },
            {
                code: "USD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Panama City",
        callingCode: "+507",
        region: "Americas",
        subregion: "Central America",
        cities: [
            "Panama City",
            "San Miguelito",
            "Colón",
            "David",
            "La Chorrera",
            "Arraiján",
            "Chitré",
            "Santiago",
            "Aguadulce",
            "Bocas del Toro",
            "Las Tablas",
            "Penonomé",
            "Changuinola",
            "Vacamonte",
            "Chepo",
            "Puerto Armuelles",
            "Pacora",
            "Santa Ana"
        ]
    },
    {
        code: "GT",
        code3: "GTM",
        name: "Guatemala",
        officialName: "Republic of Guatemala",
        flag: "🇬🇹",
        currency: {
            code: "GTQ",
            name: "Quetzal",
            symbol: "Q"
        },
        currencies: [
            {
                code: "GTQ",
                name: "Quetzal",
                symbol: "Q"
            }
        ],
        capital: "Guatemala City",
        callingCode: "+502",
        region: "Americas",
        subregion: "Central America",
        cities: [
            "Guatemala City",
            "Mixco",
            "Villa Nueva",
            "Quetzaltenango",
            "San Miguel Petapa",
            "Escuintla",
            "San Juan Sacatepéquez",
            "Villa Canales",
            "Chimaltenango",
            "Amatitlán",
            "Huehuetenango",
            "Santa Lucía Cotzumalguapa",
            "Puerto Barrios",
            "Cobán",
            "Chichicastenango",
            "Salamá",
            "Jalapa",
            "Mazatenango"
        ]
    },
    {
        code: "JM",
        code3: "JAM",
        name: "Jamaica",
        officialName: "Jamaica",
        flag: "🇯🇲",
        currency: {
            code: "JMD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "JMD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Kingston",
        callingCode: "+1-876",
        region: "Americas",
        subregion: "Caribbean",
        cities: [
            "Kingston",
            "Portmore",
            "Spanish Town",
            "Montego Bay",
            "May Pen",
            "Mandeville",
            "Old Harbour",
            "Savanna-la-Mar",
            "Ocho Ríos",
            "Linstead",
            "Port Antonio",
            "Brown's Town",
            "Annotto Bay",
            "Black River",
            "Falmouth",
            "Morant Bay",
            "Saint Ann's Bay",
            "Lucea"
        ]
    },
    {
        code: "JO",
        code3: "JOR",
        name: "Jordan",
        officialName: "Hashemite Kingdom of Jordan",
        flag: "🇯🇴",
        currency: {
            code: "JOD",
            name: "Dinar",
            symbol: "د.ا"
        },
        currencies: [
            {
                code: "JOD",
                name: "Dinar",
                symbol: "د.ا"
            }
        ],
        capital: "Amman",
        callingCode: "+962",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Amman",
            "Zarqa",
            "Irbid",
            "Russeifa",
            "Salt",
            "Aqaba",
            "Madaba",
            "Karak",
            "Jerash",
            "Ma'an",
            "Mafraq",
            "Ajloun",
            "Ramtha",
            "Tafilah",
            "As-Salt",
            "Wadi Musa",
            "Sahab",
            "Dhiban"
        ]
    },
    {
        code: "LB",
        code3: "LBN",
        name: "Lebanon",
        officialName: "Lebanese Republic",
        flag: "🇱🇧",
        currency: {
            code: "LBP",
            name: "Pound",
            symbol: "ل.ل"
        },
        currencies: [
            {
                code: "LBP",
                name: "Pound",
                symbol: "ل.ل"
            }
        ],
        capital: "Beirut",
        callingCode: "+961",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Beirut",
            "Tripoli",
            "Sidon",
            "Tyre",
            "Nabatieh",
            "Zahle",
            "Baabda",
            "Jounieh",
            "Batroun",
            "Byblos",
            "Bcharre",
            "Aley",
            "Baakline",
            "Chtoura",
            "Baalbek",
            "Hermel",
            "Rashaya",
            "Jezzine"
        ]
    },
    {
        code: "BH",
        code3: "BHR",
        name: "Bahrain",
        officialName: "Kingdom of Bahrain",
        flag: "🇧🇭",
        currency: {
            code: "BHD",
            name: "Dinar",
            symbol: "د.ب"
        },
        currencies: [
            {
                code: "BHD",
                name: "Dinar",
                symbol: "د.ب"
            }
        ],
        capital: "Manama",
        callingCode: "+973",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Manama",
            "Riffa",
            "Muharraq",
            "Hamad Town",
            "Isa Town",
            "Budaiya",
            "Jidhafs",
            "Sanabis",
            "Tubli",
            "Sitra",
            "Juffair",
            "Adliya",
            "Seef",
            "Bilad Al Qadeem",
            "Diyar Al Muharraq",
            "Amwaj Islands",
            "Zallaq",
            "Buri"
        ]
    },
    {
        code: "YE",
        code3: "YEM",
        name: "Yemen",
        officialName: "Republic of Yemen",
        flag: "🇾🇪",
        currency: {
            code: "YER",
            name: "Rial",
            symbol: "﷼"
        },
        currencies: [
            {
                code: "YER",
                name: "Rial",
                symbol: "﷼"
            }
        ],
        capital: "Sanaa",
        callingCode: "+967",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Sanaa",
            "Aden",
            "Taiz",
            "Hodeidah",
            "Mukalla",
            "Ibb",
            "Dhamar",
            "Amran",
            "Saada",
            "Bajil",
            "Zabid",
            "Bayhan",
            "Mocha",
            "Ataq",
            "Tarim",
            "Shibam",
            "Saywun",
            "Seiyun"
        ]
    },
    {
        code: "SY",
        code3: "SYR",
        name: "Syria",
        officialName: "Syrian Arab Republic",
        flag: "🇸🇾",
        currency: {
            code: "SYP",
            name: "Pound",
            symbol: "£"
        },
        currencies: [
            {
                code: "SYP",
                name: "Pound",
                symbol: "£"
            }
        ],
        capital: "Damascus",
        callingCode: "+963",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Damascus",
            "Aleppo",
            "Homs",
            "Latakia",
            "Hama",
            "Raqqa",
            "Deir ez-Zor",
            "Hasakah",
            "Qamishli",
            "Idlib",
            "Daraa",
            "Tartus",
            "Suwayda",
            "As-Suwayda",
            "Al-Hasakah",
            "Manbij",
            "Talkalakh",
            "Palmyra"
        ]
    },
    {
        code: "PS",
        code3: "PSE",
        name: "Palestine",
        officialName: "State of Palestine",
        flag: "🇵🇸",
        currency: {
            code: "ILS",
            name: "Shekel",
            symbol: "₪"
        },
        currencies: [
            {
                code: "ILS",
                name: "Shekel",
                symbol: "₪"
            }
        ],
        capital: "East Jerusalem",
        callingCode: "+970",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Gaza",
            "Khan Yunis",
            "Rafah",
            "Nablus",
            "Hebron",
            "Bethlehem",
            "Jenin",
            "Tulkarm",
            "Qalqilya",
            "Ramallah",
            "Jericho",
            "Salfit",
            "Tubas",
            "Dura",
            "Yatta",
            "Beit Lahia",
            "Beit Hanoun",
            "Deir al-Balah"
        ]
    },
    {
        code: "IL",
        code3: "ISR",
        name: "Israel",
        officialName: "State of Israel",
        flag: "🇮🇱",
        currency: {
            code: "ILS",
            name: "Shekel",
            symbol: "₪"
        },
        currencies: [
            {
                code: "ILS",
                name: "Shekel",
                symbol: "₪"
            }
        ],
        capital: "Jerusalem",
        callingCode: "+972",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Jerusalem",
            "Tel Aviv",
            "Haifa",
            "Rishon LeZion",
            "Petah Tikva",
            "Ashdod",
            "Netanya",
            "Beersheba",
            "Bnei Brak",
            "Holon",
            "Ramat Gan",
            "Ashkelon",
            "Rehovot",
            "Bat Yam",
            "Beit Shemesh",
            "Kfar Saba",
            "Herzliya",
            "Hadera"
        ]
    },
    {
        code: "BY",
        code3: "BLR",
        name: "Belarus",
        officialName: "Republic of Belarus",
        flag: "🇧🇾",
        currency: {
            code: "BYN",
            name: "Ruble",
            symbol: "Br"
        },
        currencies: [
            {
                code: "BYN",
                name: "Ruble",
                symbol: "Br"
            }
        ],
        capital: "Minsk",
        callingCode: "+375",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Minsk",
            "Gomel",
            "Mogilev",
            "Vitebsk",
            "Hrodna",
            "Brest",
            "Babruysk",
            "Baranavichy",
            "Barysau",
            "Pinsk",
            "Orsha",
            "Mazyr",
            "Salihorsk",
            "Navapolatsk",
            "Lida",
            "Polatsk",
            "Maladzyechna",
            "Zhlobin"
        ]
    },
    {
        code: "MD",
        code3: "MDA",
        name: "Moldova",
        officialName: "Republic of Moldova",
        flag: "🇲🇩",
        currency: {
            code: "MDL",
            name: "Leu",
            symbol: "L"
        },
        currencies: [
            {
                code: "MDL",
                name: "Leu",
                symbol: "L"
            }
        ],
        capital: "Chișinău",
        callingCode: "+373",
        region: "Europe",
        subregion: "Eastern Europe",
        cities: [
            "Chișinău",
            "Tiraspol",
            "Bălți",
            "Bender",
            "Rîbnița",
            "Cahul",
            "Ungheni",
            "Soroca",
            "Orhei",
            "Dubăsari",
            "Comrat",
            "Căușeni",
            "Strășeni",
            "Fălești",
            "Sângerei",
            "Edinet",
            "Cimișlia",
            "Hîncești"
        ]
    },
    {
        code: "GE",
        code3: "GEO",
        name: "Georgia",
        officialName: "Georgia",
        flag: "🇬🇪",
        currency: {
            code: "GEL",
            name: "Lari",
            symbol: "₾"
        },
        currencies: [
            {
                code: "GEL",
                name: "Lari",
                symbol: "₾"
            }
        ],
        capital: "Tbilisi",
        callingCode: "+995",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Tbilisi",
            "Batumi",
            "Kutaisi",
            "Rustavi",
            "Zugdidi",
            "Gori",
            "Poti",
            "Khashuri",
            "Samtredia",
            "Senaki",
            "Zestafoni",
            "Marneuli",
            "Telavi",
            "Akhaltsikhe",
            "Ozurgeti",
            "Mtskheta",
            "Kobuleti",
            "Tsqaltubo"
        ]
    },
    {
        code: "AM",
        code3: "ARM",
        name: "Armenia",
        officialName: "Republic of Armenia",
        flag: "🇦🇲",
        currency: {
            code: "AMD",
            name: "Dram",
            symbol: "֏"
        },
        currencies: [
            {
                code: "AMD",
                name: "Dram",
                symbol: "֏"
            }
        ],
        capital: "Yerevan",
        callingCode: "+374",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Yerevan",
            "Gyumri",
            "Vanadzor",
            "Vagharshapat",
            "Hrazdan",
            "Abovyan",
            "Kapan",
            "Armavir",
            "Ararat",
            "Gavar",
            "Goris",
            "Charentsavan",
            "Sevan",
            "Artashat",
            "Ashtarak",
            "Ijevan",
            "Sisian",
            "Tashir"
        ]
    },
    {
        code: "AZ",
        code3: "AZE",
        name: "Azerbaijan",
        officialName: "Republic of Azerbaijan",
        flag: "🇦🇿",
        currency: {
            code: "AZN",
            name: "Manat",
            symbol: "₼"
        },
        currencies: [
            {
                code: "AZN",
                name: "Manat",
                symbol: "₼"
            }
        ],
        capital: "Baku",
        callingCode: "+994",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Baku",
            "Ganja",
            "Sumqayit",
            "Mingachevir",
            "Lankaran",
            "Nakhchivan",
            "Shirvan",
            "Shamakhi",
            "Sheki",
            "Quba",
            "Khachmaz",
            "Yevlakh",
            "Jalilabad",
            "Agdash",
            "Tovuz",
            "Goychay",
            "Ujar",
            "Qabala"
        ]
    },
    {
        code: "KZ",
        code3: "KAZ",
        name: "Kazakhstan",
        officialName: "Republic of Kazakhstan",
        flag: "🇰🇿",
        currency: {
            code: "KZT",
            name: "Tenge",
            symbol: "₸"
        },
        currencies: [
            {
                code: "KZT",
                name: "Tenge",
                symbol: "₸"
            }
        ],
        capital: "Astana",
        callingCode: "+7",
        region: "Asia",
        subregion: "Central Asia",
        cities: [
            "Almaty",
            "Astana",
            "Shymkent",
            "Karaganda",
            "Aktobe",
            "Taraz",
            "Pavlodar",
            "Oskemen",
            "Semey",
            "Atyrau",
            "Kostanay",
            "Kyzylorda",
            "Petropavl",
            "Aktau",
            "Temirtau",
            "Turkestan",
            "Taldykorgan",
            "Zhezkazgan"
        ]
    },
    {
        code: "UZ",
        code3: "UZB",
        name: "Uzbekistan",
        officialName: "Republic of Uzbekistan",
        flag: "🇺🇿",
        currency: {
            code: "UZS",
            name: "Sum",
            symbol: "so'm"
        },
        currencies: [
            {
                code: "UZS",
                name: "Sum",
                symbol: "so'm"
            }
        ],
        capital: "Tashkent",
        callingCode: "+998",
        region: "Asia",
        subregion: "Central Asia",
        cities: [
            "Tashkent",
            "Namangan",
            "Samarkand",
            "Andijan",
            "Nukus",
            "Bukhara",
            "Qarshi",
            "Fergana",
            "Kokand",
            "Margilan",
            "Jizzakh",
            "Navoiy",
            "Termez",
            "Urgench",
            "Angren",
            "Chirchiq",
            "Olmaliq",
            "Yangiyer"
        ]
    },
    {
        code: "TM",
        code3: "TKM",
        name: "Turkmenistan",
        officialName: "Turkmenistan",
        flag: "🇹🇲",
        currency: {
            code: "TMT",
            name: "Manat",
            symbol: "m"
        },
        currencies: [
            {
                code: "TMT",
                name: "Manat",
                symbol: "m"
            }
        ],
        capital: "Ashgabat",
        callingCode: "+993",
        region: "Asia",
        subregion: "Central Asia",
        cities: [
            "Ashgabat",
            "Turkmenabat",
            "Daşoguz",
            "Mary",
            "Turkmenbashi",
            "Balkanabat",
            "Tejen",
            "Köneürgenç",
            "Atamurat",
            "Yolöten",
            "Serdar",
            "Baharly",
            "Göktepe",
            "Gyzylarbat",
            "Gyzyletrek",
            "Abadan",
            "Belek",
            "Garabekewül"
        ]
    },
    {
        code: "KG",
        code3: "KGZ",
        name: "Kyrgyzstan",
        officialName: "Kyrgyz Republic",
        flag: "🇰🇬",
        currency: {
            code: "KGS",
            name: "Som",
            symbol: "с"
        },
        currencies: [
            {
                code: "KGS",
                name: "Som",
                symbol: "с"
            }
        ],
        capital: "Bishkek",
        callingCode: "+996",
        region: "Asia",
        subregion: "Central Asia",
        cities: [
            "Bishkek",
            "Osh",
            "Jalal-Abad",
            "Karakol",
            "Tokmok",
            "Uzgen",
            "Balıkçı",
            "Kant",
            "Kara-Balta",
            "Naryn",
            "Talas",
            "Kyzyl-Kiya",
            "Kara-Suu",
            "Shopokov",
            "Mailuu-Suu",
            "Jumgal",
            "Kerben",
            "Isfana"
        ]
    },
    {
        code: "TJ",
        code3: "TJK",
        name: "Tajikistan",
        officialName: "Republic of Tajikistan",
        flag: "🇹🇯",
        currency: {
            code: "TJS",
            name: "Somoni",
            symbol: "ЅМ"
        },
        currencies: [
            {
                code: "TJS",
                name: "Somoni",
                symbol: "ЅМ"
            }
        ],
        capital: "Dushanbe",
        callingCode: "+992",
        region: "Asia",
        subregion: "Central Asia",
        cities: [
            "Dushanbe",
            "Khujand",
            "Bokhtar",
            "Kulob",
            "Tursunzoda",
            "Istaravshan",
            "Konibodom",
            "Vahdat",
            "Penjikent",
            "Isfara",
            "Khorugh",
            "Roghun",
            "Yovon",
            "Norak",
            "Hisor",
            "Taboshar",
            "Vose",
            "Shahritus"
        ]
    },
    {
        code: "AF",
        code3: "AFG",
        name: "Afghanistan",
        officialName: "Islamic Republic of Afghanistan",
        flag: "🇦🇫",
        currency: {
            code: "AFN",
            name: "Afghani",
            symbol: "؋"
        },
        currencies: [
            {
                code: "AFN",
                name: "Afghani",
                symbol: "؋"
            }
        ],
        capital: "Kabul",
        callingCode: "+93",
        region: "Asia",
        subregion: "Southern Asia",
        cities: [
            "Kabul",
            "Kandahar",
            "Herat",
            "Mazar-i-Sharif",
            "Kunduz",
            "Taloqan",
            "Puli Khumri",
            "Charikar",
            "Jalalabad",
            "Ghazni",
            "Bamyan",
            "Zaranj",
            "Farah",
            "Lashkar Gah",
            "Maymana",
            "Sheberghan",
            "Aybak",
            "Fayzabad"
        ]
    },
    {
        code: "NP",
        code3: "NPL",
        name: "Nepal",
        officialName: "Federal Democratic Republic of Nepal",
        flag: "🇳🇵",
        currency: {
            code: "NPR",
            name: "Rupee",
            symbol: "₨"
        },
        currencies: [
            {
                code: "NPR",
                name: "Rupee",
                symbol: "₨"
            }
        ],
        capital: "Kathmandu",
        callingCode: "+977",
        region: "Asia",
        subregion: "Southern Asia",
        cities: [
            "Kathmandu",
            "Pokhara",
            "Lalitpur",
            "Bharatpur",
            "Birgunj",
            "Biratnagar",
            "Janakpur",
            "Hetauda",
            "Dharan",
            "Butwal",
            "Nepalgunj",
            "Bhaktapur",
            "Mahendranagar",
            "Itahari",
            "Tulsipur",
            "Gulariya",
            "Lahan",
            "Birendranagar"
        ]
    },
    {
        code: "MM",
        code3: "MMR",
        name: "Myanmar",
        officialName: "Republic of the Union of Myanmar",
        flag: "🇲🇲",
        currency: {
            code: "MMK",
            name: "Kyat",
            symbol: "K"
        },
        currencies: [
            {
                code: "MMK",
                name: "Kyat",
                symbol: "K"
            }
        ],
        capital: "Naypyidaw",
        callingCode: "+95",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Yangon",
            "Mandalay",
            "Naypyidaw",
            "Mawlamyine",
            "Bago",
            "Pathein",
            "Monywa",
            "Sittwe",
            "Meiktila",
            "Myingyan",
            "Hinthada",
            "Pyay",
            "Hpa-An",
            "Dawei",
            "Lashio",
            "Pyin Oo Lwin",
            "Magway",
            "Taunggyi"
        ]
    },
    {
        code: "KH",
        code3: "KHM",
        name: "Cambodia",
        officialName: "Kingdom of Cambodia",
        flag: "🇰🇭",
        currency: {
            code: "KHR",
            name: "Riel",
            symbol: "៛"
        },
        currencies: [
            {
                code: "KHR",
                name: "Riel",
                symbol: "៛"
            },
            {
                code: "USD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Phnom Penh",
        callingCode: "+855",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Phnom Penh",
            "Battambang",
            "Siem Reap",
            "Sihanoukville",
            "Kampong Cham",
            "Poipet",
            "Pursat",
            "Kampong Chhnang",
            "Kampong Speu",
            "Takeo",
            "Kratié",
            "Stung Treng",
            "Banlung",
            "Kep",
            "Kampot",
            "Pailin",
            "Svay Rieng",
            "Samraong"
        ]
    },
    {
        code: "LA",
        code3: "LAO",
        name: "Laos",
        officialName: "Lao People's Democratic Republic",
        flag: "🇱🇦",
        currency: {
            code: "LAK",
            name: "Kip",
            symbol: "₭"
        },
        currencies: [
            {
                code: "LAK",
                name: "Kip",
                symbol: "₭"
            }
        ],
        capital: "Vientiane",
        callingCode: "+856",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Vientiane",
            "Pakse",
            "Savannakhet",
            "Luang Prabang",
            "Thakhek",
            "Xam Neua",
            "Phonsavan",
            "Muang Xay",
            "Vang Vieng",
            "Salavan",
            "Sayaboury",
            "Attapeu",
            "Champasak",
            "Sekong",
            "Luang Namtha",
            "Bokeo",
            "Bolikhamsai",
            "Khammouane"
        ]
    },
    {
        code: "BN",
        code3: "BRN",
        name: "Brunei",
        officialName: "Brunei Darussalam",
        flag: "🇧🇳",
        currency: {
            code: "BND",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "BND",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Bandar Seri Begawan",
        callingCode: "+673",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Bandar Seri Begawan",
            "Kuala Belait",
            "Seria",
            "Tutong",
            "Bangar",
            "Muara",
            "Jerudong",
            "Labi",
            "Sukang",
            "Melilas",
            "Rambai",
            "Telisai",
            "Pengkalan Batu",
            "Liang",
            "Sengkurong",
            "Bukit Beruang",
            "Pekan Bangar",
            "Kampong Pandan"
        ]
    },
    {
        code: "ZW",
        code3: "ZWE",
        name: "Zimbabwe",
        officialName: "Republic of Zimbabwe",
        flag: "🇿🇼",
        currency: {
            code: "ZWL",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "ZWL",
                name: "Dollar",
                symbol: "$"
            },
            {
                code: "USD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Harare",
        callingCode: "+263",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Harare",
            "Bulawayo",
            "Chitungwiza",
            "Mutare",
            "Gweru",
            "Kwekwe",
            "Kadoma",
            "Masvingo",
            "Chinhoyi",
            "Marondera",
            "Bindura",
            "Beitbridge",
            "Redcliff",
            "Victoria Falls",
            "Rusape",
            "Chegutu",
            "Gwanda",
            "Hwange"
        ]
    },
    {
        code: "ZM",
        code3: "ZMB",
        name: "Zambia",
        officialName: "Republic of Zambia",
        flag: "🇿🇲",
        currency: {
            code: "ZMW",
            name: "Kwacha",
            symbol: "ZK"
        },
        currencies: [
            {
                code: "ZMW",
                name: "Kwacha",
                symbol: "ZK"
            }
        ],
        capital: "Lusaka",
        callingCode: "+260",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Lusaka",
            "Kitwe",
            "Ndola",
            "Kabwe",
            "Chingola",
            "Mufulira",
            "Livingstone",
            "Luanshya",
            "Kasama",
            "Chipata",
            "Solwezi",
            "Mazabuka",
            "Chililabombwe",
            "Siavonga",
            "Mongu",
            "Sesheke",
            "Kapiri Mposhi",
            "Mansa"
        ]
    },
    {
        code: "AO",
        code3: "AGO",
        name: "Angola",
        officialName: "Republic of Angola",
        flag: "🇦🇴",
        currency: {
            code: "AOA",
            name: "Kwanza",
            symbol: "Kz"
        },
        currencies: [
            {
                code: "AOA",
                name: "Kwanza",
                symbol: "Kz"
            }
        ],
        capital: "Luanda",
        callingCode: "+244",
        region: "Africa",
        subregion: "Middle Africa",
        cities: [
            "Luanda",
            "Huambo",
            "Benguela",
            "Lobito",
            "Lucapa",
            "Malanje",
            "Namibe",
            "Sumbe",
            "Cabinda",
            "Uíge",
            "Saurimo",
            "Caxito",
            "M'banza-Kongo",
            "N'dalatando",
            "Menongue",
            "Lubango",
            "Ondjiva",
            "Luena"
        ]
    },
    {
        code: "MZ",
        code3: "MOZ",
        name: "Mozambique",
        officialName: "Republic of Mozambique",
        flag: "🇲🇿",
        currency: {
            code: "MZN",
            name: "Metical",
            symbol: "MT"
        },
        currencies: [
            {
                code: "MZN",
                name: "Metical",
                symbol: "MT"
            }
        ],
        capital: "Maputo",
        callingCode: "+258",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Maputo",
            "Matola",
            "Nampula",
            "Beira",
            "Chimoio",
            "Quelimane",
            "Tete",
            "Lichinga",
            "Pemba",
            "Xai-Xai",
            "Gurué",
            "Inhambane",
            "Dondo",
            "Maxixe",
            "Cuamba",
            "Montepuez",
            "Mocuba",
            "António Enes"
        ]
    },
    {
        code: "CM",
        code3: "CMR",
        name: "Cameroon",
        officialName: "Republic of Cameroon",
        flag: "🇨🇲",
        currency: {
            code: "XAF",
            name: "CFA Franc",
            symbol: "₣"
        },
        currencies: [
            {
                code: "XAF",
                name: "CFA Franc",
                symbol: "₣"
            }
        ],
        capital: "Yaoundé",
        callingCode: "+237",
        region: "Africa",
        subregion: "Middle Africa",
        cities: [
            "Douala",
            "Yaoundé",
            "Bamenda",
            "Bafoussam",
            "Garoua",
            "Maroua",
            "Ngaoundéré",
            "Kumba",
            "Buea",
            "Limbe",
            "Ebolowa",
            "Bertoua",
            "Kribi",
            "Loum",
            "Foumban",
            "Dschang",
            "Tiko",
            "Mbouda"
        ]
    },
    {
        code: "UG",
        code3: "UGA",
        name: "Uganda",
        officialName: "Republic of Uganda",
        flag: "🇺🇬",
        currency: {
            code: "UGX",
            name: "Shilling",
            symbol: "USh"
        },
        currencies: [
            {
                code: "UGX",
                name: "Shilling",
                symbol: "USh"
            }
        ],
        capital: "Kampala",
        callingCode: "+256",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Kampala",
            "Wakiso",
            "Mukono",
            "Mbarara",
            "Lugazi",
            "Jinja",
            "Gulu",
            "Mbale",
            "Mityana",
            "Masaka",
            "Entebbe",
            "Njeru",
            "Kasese",
            "Hoima",
            "Soroti",
            "Lira",
            "Tororo",
            "Kabale"
        ]
    },
    {
        code: "RW",
        code3: "RWA",
        name: "Rwanda",
        officialName: "Republic of Rwanda",
        flag: "🇷🇼",
        currency: {
            code: "RWF",
            name: "Franc",
            symbol: "₣"
        },
        currencies: [
            {
                code: "RWF",
                name: "Franc",
                symbol: "₣"
            }
        ],
        capital: "Kigali",
        callingCode: "+250",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Kigali",
            "Butare",
            "Gitarama",
            "Ruhengeri",
            "Gisenyi",
            "Byumba",
            "Cyangugu",
            "Kibuye",
            "Rwamagana",
            "Kibungo",
            "Gikongoro",
            "Nyanza",
            "Musanze",
            "Nyamata",
            "Kayonza",
            "Karongi",
            "Rusizi",
            "Muhanga"
        ]
    },
    {
        code: "MZ",
        code3: "MOZ",
        name: "Mozambique",
        officialName: "Republic of Mozambique",
        flag: "🇲🇿",
        currency: {
            code: "MZN",
            name: "Metical",
            symbol: "MT"
        },
        currencies: [
            {
                code: "MZN",
                name: "Metical",
                symbol: "MT"
            }
        ],
        capital: "Maputo",
        callingCode: "+258",
        region: "Africa",
        subregion: "Eastern Africa",
        cities: [
            "Maputo",
            "Matola",
            "Nampula",
            "Beira",
            "Chimoio",
            "Quelimane",
            "Tete",
            "Lichinga",
            "Pemba",
            "Xai-Xai",
            "Gurué",
            "Inhambane",
            "Dondo",
            "Maxixe",
            "Cuamba",
            "Montepuez",
            "Mocuba",
            "António Enes"
        ]
    },
    {
        code: "SG",
        code3: "SGP",
        name: "Singapore",
        officialName: "Republic of Singapore",
        flag: "🇸🇬",
        currency: {
            code: "SGD",
            name: "Dollar",
            symbol: "$"
        },
        currencies: [
            {
                code: "SGD",
                name: "Dollar",
                symbol: "$"
            }
        ],
        capital: "Singapore",
        callingCode: "+65",
        region: "Asia",
        subregion: "South-Eastern Asia",
        cities: [
            "Singapore",
            "Jurong",
            "Tampines",
            "Woodlands",
            "Bedok",
            "Sengkang",
            "Hougang",
            "Yishun",
            "Choa Chu Kang",
            "Ang Mo Kio",
            "Bukit Batok",
            "Bukit Merah",
            "Toa Payoh",
            "Geylang",
            "Kallang",
            "Pasir Ris",
            "Punggol",
            "Queenstown"
        ]
    },
    {
        code: "PS",
        code3: "PSE",
        name: "Palestine",
        officialName: "State of Palestine",
        flag: "🇵🇸",
        currency: {
            code: "ILS",
            name: "Shekel",
            symbol: "₪"
        },
        currencies: [
            {
                code: "ILS",
                name: "Shekel",
                symbol: "₪"
            }
        ],
        capital: "East Jerusalem",
        callingCode: "+970",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Gaza",
            "Khan Yunis",
            "Rafah",
            "Nablus",
            "Hebron",
            "Bethlehem",
            "Jenin",
            "Tulkarm",
            "Qalqilya",
            "Ramallah",
            "Jericho",
            "Salfit",
            "Tubas",
            "Dura",
            "Yatta",
            "Beit Lahia",
            "Beit Hanoun",
            "Deir al-Balah"
        ]
    },
    {
        code: "PS",
        code3: "PSE",
        name: "Palestine",
        officialName: "State of Palestine",
        flag: "🇵🇸",
        currency: {
            code: "ILS",
            name: "Shekel",
            symbol: "₪"
        },
        currencies: [
            {
                code: "ILS",
                name: "Shekel",
                symbol: "₪"
            }
        ],
        capital: "East Jerusalem",
        callingCode: "+970",
        region: "Asia",
        subregion: "Western Asia",
        cities: [
            "Gaza",
            "Khan Yunis",
            "Rafah",
            "Nablus",
            "Hebron",
            "Bethlehem",
            "Jenin",
            "Tulkarm",
            "Qalqilya",
            "Ramallah",
            "Jericho",
            "Salfit",
            "Tubas",
            "Dura",
            "Yatta",
            "Beit Lahia",
            "Beit Hanoun",
            "Deir al-Balah"
        ]
    },
    {
        code: "ES",
        code3: "ESP",
        name: "Spain",
        officialName: "Kingdom of Spain",
        flag: "🇪🇸",
        currency: {
            code: "EUR",
            name: "Euro",
            symbol: "€"
        },
        currencies: [
            {
                code: "EUR",
                name: "Euro",
                symbol: "€"
            }
        ],
        capital: "Madrid",
        callingCode: "+34",
        region: "Europe",
        subregion: "Southern Europe",
        cities: [
            "Madrid",
            "Barcelona",
            "Valencia",
            "Seville",
            "Zaragoza",
            "Málaga",
            "Murcia",
            "Palma",
            "Bilbao",
            "Alicante",
            "Córdoba",
            "Valladolid",
            "Vigo",
            "Gijón",
            "Granada",
            "Elche",
            "Oviedo",
            "Badalona"
        ]
    }
];
// Remove duplicates (by ISO alpha-2 code) then sort by name
const _seen = new Set();
const _unique = [];
for (const c of _raw){
    if (!_seen.has(c.code)) {
        _seen.add(c.code);
        _unique.push(c);
    }
}
const COUNTRIES = _unique.sort(_c = (a, b)=>a.name.localeCompare(b.name));
_c1 = COUNTRIES;
function getCountry(code) {
    return COUNTRIES.find((c)=>c.code === code.toUpperCase()) || null;
}
function getCities(countryCode) {
    const country = getCountry(countryCode);
    return country?.cities || [];
}
function getCountriesForSelect() {
    return COUNTRIES.map((c)=>({
            value: c.code,
            label: c.name,
            icon: c.flag,
            description: `${c.capital} · ${c.currency.code} · ${c.callingCode}`
        }));
}
function getCitiesForSelect(countryCode) {
    return getCities(countryCode).map((city)=>({
            value: city,
            label: city
        }));
}
var _c, _c1;
__turbopack_context__.k.register(_c, "COUNTRIES$_unique.sort");
__turbopack_context__.k.register(_c1, "COUNTRIES");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/ui/searchable-select.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "SearchableSelect",
    ()=>SearchableSelect
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/popover.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
function SearchableSelect({ options, value, onChange, placeholder = "Select…", searchPlaceholder = "Search…", emptyText = "No results found.", disabled, className, clearable }) {
    _s();
    const [open, setOpen] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"](false);
    const [search, setSearch] = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"]("");
    const inputRef = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"](null);
    const selected = options.find((o)=>o.value === value);
    // Filter options by search query
    const filtered = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"]({
        "SearchableSelect.useMemo[filtered]": ()=>{
            if (!search.trim()) return options;
            const q = search.toLowerCase();
            return options.filter({
                "SearchableSelect.useMemo[filtered]": (o)=>o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
            }["SearchableSelect.useMemo[filtered]"]);
        }
    }["SearchableSelect.useMemo[filtered]"], [
        options,
        search
    ]);
    // Focus input when popover opens
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"]({
        "SearchableSelect.useEffect": ()=>{
            if (open) {
                setTimeout({
                    "SearchableSelect.useEffect": ()=>inputRef.current?.focus()
                }["SearchableSelect.useEffect"], 50);
            } else {
                setSearch("");
            }
        }
    }["SearchableSelect.useEffect"], [
        open
    ]);
    function handleKeyDown(e) {
        if (e.key === "Escape") {
            setOpen(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Popover"], {
        open: open,
        onOpenChange: setOpen,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PopoverTrigger"], {
                asChild: true,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                    type: "button",
                    variant: "outline",
                    role: "combobox",
                    "aria-expanded": open,
                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("w-full justify-between font-normal", !selected && "text-muted-foreground", className),
                    disabled: disabled,
                    children: [
                        selected ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-2 truncate",
                            children: [
                                selected.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "text-base",
                                    children: selected.icon
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/searchable-select.tsx",
                                    lineNumber: 115,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: "truncate",
                                    children: selected.label
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/searchable-select.tsx",
                                    lineNumber: 116,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/searchable-select.tsx",
                            lineNumber: 114,
                            columnNumber: 13
                        }, this) : placeholder,
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "flex items-center gap-1 shrink-0",
                            children: [
                                clearable && selected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    role: "button",
                                    tabIndex: 0,
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        onChange("");
                                    },
                                    onKeyDown: (e)=>{
                                        if (e.key === "Enter" || e.key === " ") {
                                            e.stopPropagation();
                                            onChange("");
                                        }
                                    },
                                    className: "text-muted-foreground hover:text-foreground rounded p-0.5",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                        className: "size-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ui/searchable-select.tsx",
                                        lineNumber: 138,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/searchable-select.tsx",
                                    lineNumber: 123,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                    className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("size-4 opacity-50 transition-transform", open && "rotate-180")
                                }, void 0, false, {
                                    fileName: "[project]/src/components/ui/searchable-select.tsx",
                                    lineNumber: 141,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/ui/searchable-select.tsx",
                            lineNumber: 121,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/ui/searchable-select.tsx",
                    lineNumber: 105,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/ui/searchable-select.tsx",
                lineNumber: 104,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$popover$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PopoverContent"], {
                className: "w-[var(--radix-popover-trigger-width)] p-0",
                align: "start",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center border-b px-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                className: "mr-2 size-4 shrink-0 opacity-50"
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/searchable-select.tsx",
                                lineNumber: 147,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                ref: inputRef,
                                value: search,
                                onChange: (e)=>setSearch(e.target.value),
                                placeholder: searchPlaceholder,
                                className: "border-0 shadow-none focus-visible:ring-0 px-0 h-9",
                                onKeyDown: handleKeyDown
                            }, void 0, false, {
                                fileName: "[project]/src/components/ui/searchable-select.tsx",
                                lineNumber: 148,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/searchable-select.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "max-h-64 overflow-y-auto p-1",
                        children: filtered.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "py-6 text-center text-sm text-muted-foreground",
                            children: emptyText
                        }, void 0, false, {
                            fileName: "[project]/src/components/ui/searchable-select.tsx",
                            lineNumber: 159,
                            columnNumber: 13
                        }, this) : filtered.map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                onClick: ()=>{
                                    onChange(option.value);
                                    setOpen(false);
                                },
                                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["cn"])("relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm py-2 px-2 text-sm outline-none transition-colors", "hover:bg-accent hover:text-accent-foreground", value === option.value && "bg-accent text-accent-foreground"),
                                children: [
                                    option.icon && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-base shrink-0",
                                        children: option.icon
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ui/searchable-select.tsx",
                                        lineNumber: 175,
                                        columnNumber: 33
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 min-w-0 text-left",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "truncate font-medium",
                                                children: option.label
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ui/searchable-select.tsx",
                                                lineNumber: 177,
                                                columnNumber: 19
                                            }, this),
                                            option.description && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "truncate text-xs text-muted-foreground",
                                                children: option.description
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/ui/searchable-select.tsx",
                                                lineNumber: 179,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/ui/searchable-select.tsx",
                                        lineNumber: 176,
                                        columnNumber: 17
                                    }, this),
                                    value === option.value && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                        className: "size-4 shrink-0"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/ui/searchable-select.tsx",
                                        lineNumber: 182,
                                        columnNumber: 44
                                    }, this)
                                ]
                            }, option.value, true, {
                                fileName: "[project]/src/components/ui/searchable-select.tsx",
                                lineNumber: 162,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/ui/searchable-select.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this),
                    filtered.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "border-t px-3 py-1.5 text-xs text-muted-foreground",
                        children: [
                            filtered.length,
                            " option",
                            filtered.length === 1 ? "" : "s"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/ui/searchable-select.tsx",
                        lineNumber: 188,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/ui/searchable-select.tsx",
                lineNumber: 145,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/ui/searchable-select.tsx",
        lineNumber: 103,
        columnNumber: 5
    }, this);
}
_s(SearchableSelect, "8ESz1EaDwR+ECJtWKGj2CgWNa4g=");
_c = SearchableSelect;
var _c;
__turbopack_context__.k.register(_c, "SearchableSelect");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/hooks/use-api-url.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useApiUrl",
    ()=>useApiUrl,
    "useTenantKey",
    ()=>useTenantKey
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store/app-store.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
function useApiUrl() {
    _s();
    const activeTenantId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useApiUrl.useAppStore[activeTenantId]": (s)=>s.activeTenantId
    }["useApiUrl.useAppStore[activeTenantId]"]);
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useApiUrl.useAppStore[user]": (s)=>s.user
    }["useApiUrl.useAppStore[user]"]);
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].useCallback({
        "useApiUrl.useCallback": (path, params)=>{
            const url = new URL(path, ("TURBOPACK compile-time truthy", 1) ? window.location.origin : "TURBOPACK unreachable");
            // Add caller params
            if (params) {
                for (const [k, v] of Object.entries(params)){
                    if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
                }
            }
            // Add tenant context for super-admins
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSuperAdmin"])(user) && activeTenantId) {
                url.searchParams.set("tenant_id", activeTenantId);
            }
            // Return relative path + query string (for same-origin requests)
            return url.pathname + url.search;
        }
    }["useApiUrl.useCallback"], [
        activeTenantId,
        user
    ]);
}
_s(useApiUrl, "6TBUIkP+fvWw31jeymo38L87NWg=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
function useTenantKey() {
    _s1();
    const activeTenantId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useTenantKey.useAppStore[activeTenantId]": (s)=>s.activeTenantId
    }["useTenantKey.useAppStore[activeTenantId]"]);
    const user = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "useTenantKey.useAppStore[user]": (s)=>s.user
    }["useTenantKey.useAppStore[user]"]);
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isSuperAdmin"])(user)) return activeTenantId || "platform";
    return user?.tenant_id || "none";
}
_s1(useTenantKey, "vZJ484izN0BxBN964sAE+VpU854=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"]
    ];
});
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/views/partners-view.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PartnersView",
    ()=>PartnersView
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useQuery.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/useMutation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/card.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/button.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/input.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/label.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/badge.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/skeleton.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/table.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/sheet.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/alert-dialog.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/textarea.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/switch.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/progress.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/tabs.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/collapsible.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/pagination.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/users.js [app-client] (ecmascript) <export default as Users>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/pencil.js [app-client] (ecmascript) <export default as Pencil>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/eye.js [app-client] (ecmascript) <export default as Eye>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/mail.js [app-client] (ecmascript) <export default as Mail>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/phone.js [app-client] (ecmascript) <export default as Phone>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/globe.js [app-client] (ecmascript) <export default as Globe>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/map-pin.js [app-client] (ecmascript) <export default as MapPin>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/building-2.js [app-client] (ecmascript) <export default as Building2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/shield-check.js [app-client] (ecmascript) <export default as ShieldCheck>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/star.js [app-client] (ecmascript) <export default as Star>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/maximize-2.js [app-client] (ecmascript) <export default as Maximize2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/dollar-sign.js [app-client] (ecmascript) <export default as DollarSign>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-down.js [app-client] (ecmascript) <export default as ChevronDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/chevron-right.js [app-client] (ecmascript) <export default as ChevronRight>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/external-link.js [app-client] (ecmascript) <export default as ExternalLink>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/send.js [app-client] (ecmascript) <export default as Send>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/zap.js [app-client] (ecmascript) <export default as Zap>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-check.js [app-client] (ecmascript) <export default as CheckCircle2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/clock.js [app-client] (ecmascript) <export default as Clock>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-alert.js [app-client] (ecmascript) <export default as AlertCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/circle-x.js [app-client] (ecmascript) <export default as XCircle>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/key-round.js [app-client] (ecmascript) <export default as KeyRound>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/loader-circle.js [app-client] (ecmascript) <export default as Loader2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/copy.js [app-client] (ecmascript) <export default as Copy>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/check.js [app-client] (ecmascript) <export default as Check>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/link.js [app-client] (ecmascript) <export default as Link>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/download.js [app-client] (ecmascript) <export default as Download>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/message-square.js [app-client] (ecmascript) <export default as MessageSquare>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$page$2d$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/common/page-header.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$empty$2d$state$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/common/empty-state.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/utils/format.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$portal$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/portal/tiers.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/store/app-store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$reference$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/reference.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$geo$2f$countries$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/data/geo/countries.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$searchable$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/ui/searchable-select.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/hooks/use-api-url.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature(), _s2 = __turbopack_context__.k.signature(), _s3 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
const PAGE_SIZE = 20;
const TYPE_LABELS = {
    buyer: "Buyer",
    supplier: "Supplier",
    both: "Buyer & Supplier",
    agent: "Agent",
    logistics: "Logistics",
    customs: "Customs",
    bank: "Bank",
    inspector: "Inspector"
};
const STATUS_LABELS = {
    active: "Active",
    inactive: "Inactive",
    blacklisted: "Blacklisted"
};
const STATUS_BADGE = {
    active: "default",
    inactive: "secondary",
    blacklisted: "destructive"
};
const KYC_LABELS = {
    not_submitted: "Not submitted",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected"
};
const PORTAL_STATUS_LABELS = {
    pending_approval: "Pending Approval",
    approved: "Approved",
    invited: "Invited",
    active: "Active",
    suspended: "Suspended",
    revoked: "Revoked"
};
const PORTAL_STATUS_ICON = {
    pending_approval: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$clock$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Clock$3e$__["Clock"],
    approved: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
    invited: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"],
    active: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"],
    suspended: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$alert$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__AlertCircle$3e$__["AlertCircle"],
    revoked: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__XCircle$3e$__["XCircle"]
};
const PORTAL_STATUS_BADGE = {
    pending_approval: "outline",
    approved: "secondary",
    invited: "default",
    active: "default",
    suspended: "destructive",
    revoked: "destructive"
};
const TIER_INFO = {
    premium: {
        label: "Premium",
        description: "VIP client. Light KYC review only — document verification and geolocation are optional. Full feature access.",
        features: [
            "Full feature access",
            "Light KYC review (no document upload required)",
            "Geolocation not required",
            "PDF downloads",
            "RFQ submission",
            "Company info access"
        ]
    },
    business: {
        label: "Business",
        description: "Trusted regular client. Full KYC, document upload, and geolocation required. Full feature access.",
        features: [
            "Full feature access",
            "Full KYC verification required",
            "Document upload required",
            "Geolocation required",
            "PDF downloads",
            "RFQ submission"
        ]
    },
    standard: {
        label: "Standard",
        description: "Standard client. Full KYC, documents, and geolocation required. Can submit RFQs but cannot download PDFs.",
        features: [
            "View offers / documents / catalog",
            "Submit RFQs",
            "Full KYC + documents + geolocation required",
            "No PDF download"
        ]
    },
    basic: {
        label: "Basic",
        description: "Entry-level / trial client. Full KYC, documents, and geolocation required. Read-only access.",
        features: [
            "View catalog and own offers",
            "No RFQ submission",
            "No PDF download",
            "Full KYC + documents + geolocation required"
        ]
    },
    limited: {
        label: "Basic (legacy)",
        description: "Legacy limited tier — equivalent to Basic.",
        features: [
            "Same as Basic tier"
        ]
    }
};
function riskColor(score) {
    if (score < 30) return "text-emerald-600";
    if (score < 60) return "text-amber-600";
    return "text-destructive";
}
// Helper to generate a partner code from company name
function generatePartnerCode(name) {
    return name.toUpperCase().replace(/[^A-Z0-9\s]/g, "").split(/\s+/).filter(Boolean).slice(0, 3).map((w)=>w.slice(0, 3)).join("").slice(0, 8);
}
function PartnersView() {
    _s();
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiUrl"])();
    const tenantKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenantKey"])();
    const qc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const setView = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "PartnersView.useAppStore[setView]": (s)=>s.setView
    }["PartnersView.useAppStore[setView]"]);
    const setSelectedId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"])({
        "PartnersView.useAppStore[setSelectedId]": (s)=>s.setSelectedId
    }["PartnersView.useAppStore[setSelectedId]"]);
    const [search, setSearch] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [statusFilter, setStatusFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [typeFilter, setTypeFilter] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("all");
    const [page, setPage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [editing, setEditing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showForm, setShowForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [detailId, setDetailId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [deleteId, setDeleteId] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // Wrapper setters that reset page when filters change
    const handleSearchChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PartnersView.useCallback[handleSearchChange]": (v)=>{
            setSearch(v);
            setPage(1);
        }
    }["PartnersView.useCallback[handleSearchChange]"], []);
    const handleStatusFilterChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PartnersView.useCallback[handleStatusFilterChange]": (v)=>{
            setStatusFilter(v);
            setPage(1);
        }
    }["PartnersView.useCallback[handleStatusFilterChange]"], []);
    const handleTypeFilterChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PartnersView.useCallback[handleTypeFilterChange]": (v)=>{
            setTypeFilter(v);
            setPage(1);
        }
    }["PartnersView.useCallback[handleTypeFilterChange]"], []);
    const { data, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "partners",
            tenantKey,
            search,
            statusFilter,
            typeFilter,
            page
        ],
        queryFn: {
            "PartnersView.useQuery": async ()=>{
                const params = new URLSearchParams();
                if (search) params.set("search", search);
                if (statusFilter !== "all") params.set("status", statusFilter);
                if (typeFilter !== "all") params.set("type", typeFilter);
                params.set("limit", String(PAGE_SIZE));
                params.set("offset", String((page - 1) * PAGE_SIZE));
                const r = await fetch(api(`/api/partners?${params}`));
                if (!r.ok) throw new Error("Failed to load partners");
                return r.json();
            }
        }["PartnersView.useQuery"]
    });
    const detail = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "partner",
            tenantKey,
            detailId
        ],
        queryFn: {
            "PartnersView.useQuery[detail]": async ()=>{
                const r = await fetch(api(`/api/partners/${detailId}`));
                if (!r.ok) throw new Error("Failed to load partner");
                return r.json();
            }
        }["PartnersView.useQuery[detail]"],
        enabled: !!detailId
    });
    const partnerDeals = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "deals",
            tenantKey,
            "partner",
            detailId
        ],
        queryFn: {
            "PartnersView.useQuery[partnerDeals]": async ()=>{
                const r = await fetch(api(`/api/deals?partner_id=${detailId}`));
                if (!r.ok) throw new Error("Failed to load deals");
                return r.json();
            }
        }["PartnersView.useQuery[partnerDeals]"],
        enabled: !!detailId
    });
    const deleteMut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "PartnersView.useMutation[deleteMut]": async (id)=>{
                const r = await fetch(api(`/api/partners/${id}`), {
                    method: "DELETE"
                });
                if (!r.ok) throw new Error("Delete failed");
            }
        }["PartnersView.useMutation[deleteMut]"],
        onSuccess: {
            "PartnersView.useMutation[deleteMut]": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Partner deleted.");
                qc.invalidateQueries({
                    queryKey: [
                        "partners",
                        tenantKey
                    ]
                });
                qc.invalidateQueries({
                    queryKey: [
                        "dashboard",
                        tenantKey
                    ]
                });
                setDeleteId(null);
            }
        }["PartnersView.useMutation[deleteMut]"],
        onError: {
            "PartnersView.useMutation[deleteMut]": ()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Delete failed.")
        }["PartnersView.useMutation[deleteMut]"]
    });
    const items = data?.items || [];
    const total = data?.total ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$page$2d$header$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PageHeader"], {
                title: "Partners",
                description: `${total} total`,
                actions: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: ()=>window.open("/api/partners/export?format=csv", "_blank"),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$download$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Download$3e$__["Download"], {
                                    className: "size-4 mr-1"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 265,
                                    columnNumber: 15
                                }, void 0),
                                " Export CSV"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 264,
                            columnNumber: 13
                        }, void 0),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>{
                                setEditing(null);
                                setShowForm(true);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "size-4 mr-1"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 268,
                                    columnNumber: 15
                                }, void 0),
                                " New partner"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 267,
                            columnNumber: 13
                        }, void 0)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 263,
                    columnNumber: 11
                }, void 0)
            }, void 0, false, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 259,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "mb-4 border-border/60 shadow-soft rounded-xl",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "p-3 flex flex-col md:flex-row gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "relative flex-1",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                    className: "absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 277,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                    placeholder: "Search by name, email, or phone…",
                                    value: search,
                                    onChange: (e)=>handleSearchChange(e.target.value),
                                    className: "pl-9"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 278,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 276,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                            value: statusFilter,
                            onValueChange: handleStatusFilterChange,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                    className: "w-full md:w-44",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                        placeholder: "Status"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 286,
                                        columnNumber: 55
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 286,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "all",
                                            children: "All statuses"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 288,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "active",
                                            children: "Active"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 289,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "inactive",
                                            children: "Inactive"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 290,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "blacklisted",
                                            children: "Blacklisted"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 291,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 287,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 285,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                            value: typeFilter,
                            onValueChange: handleTypeFilterChange,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                    className: "w-full md:w-44",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                        placeholder: "Type"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 295,
                                        columnNumber: 55
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 295,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "all",
                                            children: "All types"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 297,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "buyer",
                                            children: "Buyer"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 298,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "supplier",
                                            children: "Supplier"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 299,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "both",
                                            children: "Buyer & Supplier"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 300,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "agent",
                                            children: "Agent"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 301,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "logistics",
                                            children: "Logistics"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 302,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "customs",
                                            children: "Customs"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 303,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "bank",
                                            children: "Bank"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 304,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                            value: "inspector",
                                            children: "Inspector"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 305,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 296,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 294,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 275,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 274,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                className: "border-border/60 shadow-soft rounded-xl",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                    className: "p-0",
                    children: isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 space-y-2",
                        children: Array.from({
                            length: 6
                        }).map((_, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                                className: "h-12 w-full"
                            }, i, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 315,
                                columnNumber: 56
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 314,
                        columnNumber: 13
                    }, this) : items.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$common$2f$empty$2d$state$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["EmptyState"], {
                        icon: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$users$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Users$3e$__["Users"], {
                            className: "size-6"
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 319,
                            columnNumber: 21
                        }, void 0),
                        title: "No partners",
                        description: "Add your first partner to get started.",
                        action: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: ()=>{
                                setEditing(null);
                                setShowForm(true);
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                    className: "size-4 mr-1"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 322,
                                    columnNumber: 88
                                }, void 0),
                                " New partner"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 322,
                            columnNumber: 23
                        }, void 0)
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 318,
                        columnNumber: 13
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "max-h-[calc(100vh-340px)] overflow-y-auto custom-scroll",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Table"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHeader"], {
                                            className: "sticky top-0 bg-card z-10",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                        children: "Name"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 330,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                        className: "hidden md:table-cell",
                                                        children: "Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 331,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                        className: "hidden lg:table-cell",
                                                        children: "Contact"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 332,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                        children: "Status"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 333,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                        className: "w-32",
                                                        children: "Risk"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 334,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                        className: "hidden xl:table-cell",
                                                        children: "KYC"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 335,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                        className: "hidden xl:table-cell",
                                                        children: "Portal"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 336,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableHead"], {
                                                        className: "text-right",
                                                        children: "Actions"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 337,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 329,
                                                columnNumber: 21
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 328,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableBody"], {
                                            children: items.map((p)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableRow"], {
                                                    className: "cursor-pointer hover:bg-muted/50 transition-colors",
                                                    onClick: ()=>setDetailId(p.id),
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "font-medium flex items-center gap-1.5",
                                                                    children: [
                                                                        p.name,
                                                                        p.is_commissioner && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                                                            className: "size-3.5 text-primary"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 351,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 348,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-muted-foreground",
                                                                    children: [
                                                                        p.city,
                                                                        p.country
                                                                    ].filter(Boolean).join(", ") || "—"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 354,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 347,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "hidden md:table-cell",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: "outline",
                                                                children: TYPE_LABELS[p.type]
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 359,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 358,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "hidden lg:table-cell",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-sm",
                                                                    children: p.contact_name || "—"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 362,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "text-xs text-muted-foreground",
                                                                    children: p.contact_email || p.email || "—"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 363,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 361,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: STATUS_BADGE[p.status],
                                                                children: STATUS_LABELS[p.status]
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 366,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 365,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-2",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$progress$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Progress"], {
                                                                        value: p.risk_score,
                                                                        className: "h-1.5 w-16"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 370,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: `text-xs tabular ${riskColor(p.risk_score)}`,
                                                                        children: p.risk_score
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 371,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 369,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 368,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "hidden xl:table-cell",
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: p.kyc_status === "approved" ? "default" : p.kyc_status === "pending" ? "secondary" : "outline",
                                                                children: KYC_LABELS[p.kyc_status]
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 375,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 374,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "hidden xl:table-cell",
                                                            children: p.portal_enabled ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: "secondary",
                                                                className: "gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                                        className: "size-3"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 382,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    " ",
                                                                    p.portal_level
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 381,
                                                                columnNumber: 29
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: "—"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 385,
                                                                columnNumber: 29
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 379,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$table$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TableCell"], {
                                                            className: "text-right",
                                                            onClick: (e)=>e.stopPropagation(),
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-end gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                        size: "icon",
                                                                        variant: "ghost",
                                                                        className: "size-8",
                                                                        onClick: ()=>setDetailId(p.id),
                                                                        title: "View",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$eye$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Eye$3e$__["Eye"], {
                                                                            className: "size-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 391,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 390,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                        size: "icon",
                                                                        variant: "ghost",
                                                                        className: "size-8 text-primary",
                                                                        title: "View 360°",
                                                                        onClick: ()=>{
                                                                            setSelectedId(p.id);
                                                                            setView("partner-360");
                                                                        },
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$maximize$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Maximize2$3e$__["Maximize2"], {
                                                                            className: "size-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 403,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 393,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                        size: "icon",
                                                                        variant: "ghost",
                                                                        className: "size-8",
                                                                        onClick: ()=>{
                                                                            setEditing(p);
                                                                            setShowForm(true);
                                                                        },
                                                                        title: "Edit",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$pencil$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Pencil$3e$__["Pencil"], {
                                                                            className: "size-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 406,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 405,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                                        size: "icon",
                                                                        variant: "ghost",
                                                                        className: "size-8 text-destructive",
                                                                        onClick: ()=>setDeleteId(p.id),
                                                                        title: "Delete",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                            className: "size-4"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 409,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 408,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 389,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 388,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, p.id, true, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 342,
                                                    columnNumber: 23
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 340,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 327,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 326,
                                columnNumber: 15
                            }, this),
                            totalPages > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center justify-between border-t px-4 py-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-muted-foreground",
                                        children: [
                                            "Showing ",
                                            (page - 1) * PAGE_SIZE + 1,
                                            "–",
                                            Math.min(page * PAGE_SIZE, total),
                                            " of ",
                                            total
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 422,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Pagination"], {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationContent"], {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationItem"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationPrevious"], {
                                                        onClick: ()=>setPage((p)=>Math.max(1, p - 1)),
                                                        className: page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 428,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 427,
                                                    columnNumber: 23
                                                }, this),
                                                generatePageNumbers(page, totalPages).map((p, i)=>p === "ellipsis" ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationItem"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationEllipsis"], {}, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 436,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, `ellipsis-${i}`, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 435,
                                                        columnNumber: 27
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationItem"], {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationLink"], {
                                                            isActive: page === p,
                                                            onClick: ()=>setPage(p),
                                                            className: "cursor-pointer",
                                                            children: p
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 440,
                                                            columnNumber: 29
                                                        }, this)
                                                    }, p, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 439,
                                                        columnNumber: 27
                                                    }, this)),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationItem"], {
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$pagination$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PaginationNext"], {
                                                        onClick: ()=>setPage((p)=>Math.min(totalPages, p + 1)),
                                                        className: page >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 451,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 450,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 426,
                                            columnNumber: 21
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 425,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 421,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true)
                }, void 0, false, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 312,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 311,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PartnerFormDialog, {
                open: showForm,
                onOpenChange: setShowForm,
                partner: editing,
                onSaved: ()=>{
                    setShowForm(false);
                    qc.invalidateQueries({
                        queryKey: [
                            "partners",
                            tenantKey
                        ]
                    });
                    qc.invalidateQueries({
                        queryKey: [
                            "dashboard",
                            tenantKey
                        ]
                    });
                }
            }, void 0, false, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 466,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Sheet"], {
                open: !!detailId,
                onOpenChange: (o)=>!o && setDetailId(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetContent"], {
                    className: "w-full sm:max-w-2xl overflow-y-auto custom-scroll",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetHeader"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetTitle"], {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                            className: "size-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 482,
                                            columnNumber: 15
                                        }, this),
                                        detail.data?.name || "Partner"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 481,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$sheet$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SheetDescription"], {
                                    children: "Partner details"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 485,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 480,
                            columnNumber: 11
                        }, this),
                        detail.isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-4 space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                                    className: "h-20 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 489,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                                    className: "h-40 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 490,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 488,
                            columnNumber: 13
                        }, this) : detail.data ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PartnerDetail, {
                            partner: detail.data,
                            deals: partnerDeals.data?.items || []
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 493,
                            columnNumber: 13
                        }, this) : null
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 479,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 478,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialog"], {
                open: !!deleteId,
                onOpenChange: (o)=>!o && setDeleteId(null),
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogContent"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogHeader"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogTitle"], {
                                    children: "Delete partner?"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 502,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogDescription"], {
                                    children: "This action cannot be undone. Related offers and deals may lose their reference."
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 503,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 501,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogFooter"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogCancel"], {
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 508,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$alert$2d$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AlertDialogAction"], {
                                    onClick: ()=>deleteId && deleteMut.mutate(deleteId),
                                    className: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                                    children: "Delete"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 509,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 507,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 500,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 499,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/views/partners-view.tsx",
        lineNumber: 258,
        columnNumber: 5
    }, this);
}
_s(PartnersView, "BMsCbaq8aGz5jhJA13lfU2DBnUE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiUrl"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenantKey"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$store$2f$app$2d$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppStore"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c = PartnersView;
// ---- Pagination helper ----
function generatePageNumbers(current, total) {
    if (total <= 7) return Array.from({
        length: total
    }, (_, i)=>i + 1);
    const pages = [
        1
    ];
    if (current > 3) pages.push("ellipsis");
    for(let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++){
        pages.push(i);
    }
    if (current < total - 2) pages.push("ellipsis");
    pages.push(total);
    return pages;
}
// ---- Detail panel ----
function PartnerDetail({ partner, deals }) {
    _s1();
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiUrl"])();
    const tenantKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenantKey"])();
    const qc = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"])();
    const contactInfo = [
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$mail$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Mail$3e$__["Mail"],
            label: "Email",
            value: partner.email
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$phone$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Phone$3e$__["Phone"],
            label: "Phone",
            value: partner.phone
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$globe$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Globe$3e$__["Globe"],
            label: "Website",
            value: partner.website
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$map$2d$pin$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MapPin$3e$__["MapPin"],
            label: "Address",
            value: [
                partner.address_line,
                partner.city,
                partner.state,
                partner.postal_code,
                partner.country
            ].filter(Boolean).join(", ") || null
        },
        {
            icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"],
            label: "Tax ID",
            value: partner.tax_id
        }
    ].filter((x)=>x.value);
    // Portal access state
    const [showActivateDialog, setShowActivateDialog] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [portalEmail, setPortalEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(partner.email || "");
    const [portalTier, setPortalTier] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("standard");
    const [creatingPortal, setCreatingPortal] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [sendingInvite, setSendingInvite] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [testPassword, setTestPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [settingTestPwd, setSettingTestPwd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [copiedUrl, setCopiedUrl] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [copiedPwd, setCopiedPwd] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [copiedEmail, setCopiedEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [adminMessage, setAdminMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [sendingMessage, setSendingMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [messageRefreshKey, setMessageRefreshKey] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    // Fetch portal access for this partner
    const portalQuery = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"])({
        queryKey: [
            "portal-access",
            tenantKey,
            partner.id
        ],
        queryFn: {
            "PartnerDetail.useQuery[portalQuery]": async ()=>{
                const r = await fetch(api(`/api/portal-access?partner_id=${partner.id}`));
                if (!r.ok) throw new Error("Failed to load portal access");
                const data = await r.json();
                // API returns { items: PortalAccess[] }, find the one for this partner
                const items = data.items || [];
                return items.find({
                    "PartnerDetail.useQuery[portalQuery]": (p)=>p.partner_id === partner.id
                }["PartnerDetail.useQuery[portalQuery]"]) || null;
            }
        }["PartnerDetail.useQuery[portalQuery]"],
        enabled: !!partner.id
    });
    const portalAccess = portalQuery.data;
    // Create portal access mutation
    const createPortalMut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "PartnerDetail.useMutation[createPortalMut]": async (data)=>{
                const r = await fetch(api("/api/portal-access"), {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        partner_id: data.partner_id,
                        portal_email: data.portal_email,
                        tier: data.tier,
                        status: "approved",
                        can_view_offers: true,
                        can_view_documents: true,
                        can_view_catalog: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$portal$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTierMeta"])(data.tier).canSubmitRfq || data.tier !== "basic",
                        can_view_invoices: data.tier === "premium" || data.tier === "business",
                        can_view_profile: true,
                        can_view_company_info: data.tier === "premium" || data.tier === "business",
                        can_submit_rfq: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$portal$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTierMeta"])(data.tier).canSubmitRfq,
                        can_download_pdf: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$portal$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTierMeta"])(data.tier).canDownloadPdf,
                        exempt_kyc: !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$portal$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTierMeta"])(data.tier).requiresKyc,
                        exempt_document_upload: !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$portal$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTierMeta"])(data.tier).requiresDocuments,
                        exempt_location_share: !(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$portal$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTierMeta"])(data.tier).requiresLocation,
                        must_set_password: true
                    })
                });
                if (!r.ok) {
                    const e = await r.json().catch({
                        "PartnerDetail.useMutation[createPortalMut]": ()=>({})
                    }["PartnerDetail.useMutation[createPortalMut]"]);
                    throw new Error(e.error || "Failed to create portal access");
                }
                return r.json();
            }
        }["PartnerDetail.useMutation[createPortalMut]"],
        onSuccess: {
            "PartnerDetail.useMutation[createPortalMut]": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Portal access activated!");
                qc.invalidateQueries({
                    queryKey: [
                        "portal-access",
                        tenantKey,
                        partner.id
                    ]
                });
                qc.invalidateQueries({
                    queryKey: [
                        "partners",
                        tenantKey
                    ]
                });
                setShowActivateDialog(false);
            }
        }["PartnerDetail.useMutation[createPortalMut]"],
        onError: {
            "PartnerDetail.useMutation[createPortalMut]": (e)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(e.message || "Failed to activate portal.")
        }["PartnerDetail.useMutation[createPortalMut]"]
    });
    // Send invite email mutation
    const sendInviteMut = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"])({
        mutationFn: {
            "PartnerDetail.useMutation[sendInviteMut]": async ()=>{
                if (!portalAccess?.id) throw new Error("No portal access found");
                const r = await fetch(api(`/api/portal-access/${portalAccess.id}/invite`), {
                    method: "POST"
                });
                if (!r.ok) {
                    const e = await r.json().catch({
                        "PartnerDetail.useMutation[sendInviteMut]": ()=>({})
                    }["PartnerDetail.useMutation[sendInviteMut]"]);
                    throw new Error(e.error || "Failed to send invite");
                }
                return r.json();
            }
        }["PartnerDetail.useMutation[sendInviteMut]"],
        onSuccess: {
            "PartnerDetail.useMutation[sendInviteMut]": ()=>{
                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Invite email sent!");
                qc.invalidateQueries({
                    queryKey: [
                        "portal-access",
                        tenantKey,
                        partner.id
                    ]
                });
            }
        }["PartnerDetail.useMutation[sendInviteMut]"],
        onError: {
            "PartnerDetail.useMutation[sendInviteMut]": (e)=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(e.message || "Failed to send invite.")
        }["PartnerDetail.useMutation[sendInviteMut]"]
    });
    const handleActivatePortal = async ()=>{
        if (!portalEmail.trim()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Portal email is required.");
            return;
        }
        createPortalMut.mutate({
            partner_id: partner.id,
            portal_email: portalEmail.trim(),
            tier: portalTier
        });
    };
    const handleSendInvite = async ()=>{
        setSendingInvite(true);
        try {
            await sendInviteMut.mutateAsync();
        } finally{
            setSendingInvite(false);
        }
    };
    // Generate a random test password
    const generateTestPassword = ()=>{
        const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let pwd = "";
        for(let i = 0; i < 10; i++)pwd += chars[Math.floor(Math.random() * chars.length)];
        return pwd;
    };
    // Set a test password for the portal user
    const handleSetTestPassword = async ()=>{
        if (!portalAccess?.id) return;
        setSettingTestPwd(true);
        try {
            const pwd = generateTestPassword();
            const res = await fetch(api("/api/portal/setup-password"), {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    access_id: portalAccess.id,
                    password: pwd
                })
            });
            if (!res.ok) {
                const e = await res.json().catch(()=>({}));
                throw new Error(e.error || "Failed to set test password");
            }
            setTestPassword(pwd);
            qc.invalidateQueries({
                queryKey: [
                    "portal-access",
                    tenantKey,
                    partner.id
                ]
            });
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Test password set successfully!");
        } catch (e) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(e.message || "Failed to set test password.");
        } finally{
            setSettingTestPwd(false);
        }
    };
    const copyToClipboard = async (text, type)=>{
        try {
            await navigator.clipboard.writeText(text);
            if (type === "url") {
                setCopiedUrl(true);
                setTimeout(()=>setCopiedUrl(false), 2000);
            }
            if (type === "pwd") {
                setCopiedPwd(true);
                setTimeout(()=>setCopiedPwd(false), 2000);
            }
            if (type === "email") {
                setCopiedEmail(true);
                setTimeout(()=>setCopiedEmail(false), 2000);
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Copied to clipboard!");
        } catch  {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Failed to copy to clipboard.");
        }
    };
    const portalLoginUrl = ("TURBOPACK compile-time truthy", 1) ? `${window.location.origin}/portal/login?email=${encodeURIComponent(portalAccess?.portal_email || "")}` : "TURBOPACK unreachable";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "px-4 pb-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-wrap items-center gap-2 mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: STATUS_BADGE[partner.status],
                        children: STATUS_LABELS[partner.status]
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 714,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        children: TYPE_LABELS[partner.type]
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 715,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "outline",
                        children: partner.entity_type === "company" ? "Company" : "Individual"
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 716,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: partner.kyc_status === "approved" ? "default" : "outline",
                        className: "gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                className: "size-3"
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 718,
                                columnNumber: 11
                            }, this),
                            " ",
                            KYC_LABELS[partner.kyc_status]
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 717,
                        columnNumber: 9
                    }, this),
                    partner.portal_enabled && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "secondary",
                        className: "gap-1",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                className: "size-3"
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 722,
                                columnNumber: 13
                            }, this),
                            " Portal: ",
                            partner.portal_level
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 721,
                        columnNumber: 11
                    }, this),
                    partner.is_commissioner && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: "secondary",
                        className: "gap-1 bg-primary/10 text-primary",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$dollar$2d$sign$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__DollarSign$3e$__["DollarSign"], {
                                className: "size-3"
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 727,
                                columnNumber: 13
                            }, this),
                            " Commission Agent"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 726,
                        columnNumber: 11
                    }, this),
                    portalAccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                        variant: PORTAL_STATUS_BADGE[portalAccess.status],
                        className: "gap-1",
                        children: [
                            (()=>{
                                const Icon = PORTAL_STATUS_ICON[portalAccess.status];
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                    className: "size-3"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 732,
                                    columnNumber: 84
                                }, this);
                            })(),
                            "Portal: ",
                            PORTAL_STATUS_LABELS[portalAccess.status]
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 731,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 713,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "grid grid-cols-2 gap-2 mb-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "border-border/60 shadow-soft rounded-xl",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: "Risk"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 742,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: `text-2xl font-semibold tabular ${riskColor(partner.risk_score)}`,
                                    children: partner.risk_score
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 743,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 741,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 740,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                        className: "border-border/60 shadow-soft rounded-xl",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                            className: "p-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-muted-foreground",
                                    children: "Deals"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 748,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-2xl font-semibold tabular",
                                    children: deals.length
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 749,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 747,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 746,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 739,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Tabs"], {
                defaultValue: "info",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsList"], {
                        className: "grid w-full grid-cols-5",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "info",
                                children: "Info"
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 756,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "contact",
                                children: "Contact"
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 757,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "bank",
                                children: "Bank"
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 758,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "deals",
                                children: "Deals"
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 759,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsTrigger"], {
                                value: "portal",
                                className: "gap-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                                        className: "size-3.5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 761,
                                        columnNumber: 13
                                    }, this),
                                    " Portal"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 760,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 755,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "info",
                        className: "space-y-3 mt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-2 gap-2",
                                children: [
                                    partner.preferred_currency && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-md bg-muted/30",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Currency"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 770,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium",
                                                children: partner.preferred_currency
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 771,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 769,
                                        columnNumber: 15
                                    }, this),
                                    partner.preferred_payment_terms && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-md bg-muted/30",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Payment Terms"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 776,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium",
                                                children: partner.preferred_payment_terms
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 777,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 775,
                                        columnNumber: 15
                                    }, this),
                                    partner.preferred_incoterm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-md bg-muted/30",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Incoterm"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 782,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium",
                                                children: partner.preferred_incoterm
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 783,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 781,
                                        columnNumber: 15
                                    }, this),
                                    partner.vat_number && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-md bg-muted/30",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "VAT Number"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 788,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium",
                                                children: partner.vat_number
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 789,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 787,
                                        columnNumber: 15
                                    }, this),
                                    partner.registration_number && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "p-2 rounded-md bg-muted/30",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-muted-foreground",
                                                children: "Registration No."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 794,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-medium",
                                                children: partner.registration_number
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 795,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 793,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 767,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-md border border-border/60",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mb-1 flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$shield$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ShieldCheck$3e$__["ShieldCheck"], {
                                                className: "size-3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 803,
                                                columnNumber: 15
                                            }, this),
                                            " KYC Verification"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 802,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium",
                                        children: KYC_LABELS[partner.kyc_status]
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 805,
                                        columnNumber: 13
                                    }, this),
                                    partner.kyc_reviewed_by && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mt-1",
                                        children: [
                                            "Reviewed ",
                                            partner.kyc_reviewed_at ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtDate"])(partner.kyc_reviewed_at) : ""
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 807,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 801,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "p-3 rounded-md border border-border/60",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mb-1 flex items-center gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$star$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Star$3e$__["Star"], {
                                                className: "size-3"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 816,
                                                columnNumber: 15
                                            }, this),
                                            " Portal Access"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 815,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-medium",
                                        children: partner.portal_enabled ? `Enabled (${partner.portal_level})` : "Disabled"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 818,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 814,
                                columnNumber: 11
                            }, this),
                            partner.notes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-sm mt-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mb-1",
                                        children: "Notes"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 826,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "whitespace-pre-wrap p-3 rounded-md bg-muted/50",
                                        children: partner.notes
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 827,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 825,
                                columnNumber: 13
                            }, this),
                            partner.tags && partner.tags.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-1 mt-3",
                                children: partner.tags.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                        variant: "secondary",
                                        children: t
                                    }, t, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 834,
                                        columnNumber: 40
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 833,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-xs text-muted-foreground pt-2 border-t",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            "Created ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtDate"])(partner.created_at)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 840,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            "Updated ",
                                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtRelative"])(partner.updated_at)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 841,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 839,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 765,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "contact",
                        className: "space-y-2 mt-3",
                        children: [
                            contactInfo.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-muted-foreground py-4 text-center",
                                children: "No contact information."
                            }, void 0, false, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 847,
                                columnNumber: 13
                            }, this) : contactInfo.map((x)=>{
                                const Icon = x.icon;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-start gap-3 p-2 rounded-md hover:bg-muted/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            className: "size-4 text-muted-foreground mt-0.5 shrink-0"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 852,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground",
                                                    children: x.label
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 854,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm break-words",
                                                    children: x.value
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 855,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 853,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, x.label, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 851,
                                    columnNumber: 15
                                }, this);
                            }),
                            (partner.contact_name || partner.contact_email || partner.contact_phone) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "pt-3 border-t mt-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-muted-foreground mb-2",
                                        children: "Contact Person"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 863,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-1",
                                        children: [
                                            partner.contact_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm",
                                                children: partner.contact_name
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 865,
                                                columnNumber: 42
                                            }, this),
                                            partner.contact_email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-muted-foreground",
                                                children: partner.contact_email
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 866,
                                                columnNumber: 43
                                            }, this),
                                            partner.contact_phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-muted-foreground",
                                                children: partner.contact_phone
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 867,
                                                columnNumber: 43
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 864,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 862,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 845,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "bank",
                        className: "space-y-2 mt-3",
                        children: !partner.bank_name && !partner.bank_account && !partner.bank_swift && !partner.bank_iban ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground py-4 text-center",
                            children: "No bank details on file."
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 875,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: [
                                partner.bank_name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 rounded-md hover:bg-muted/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: "Bank Name"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 880,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm",
                                            children: partner.bank_name
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 881,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 879,
                                    columnNumber: 17
                                }, this),
                                partner.bank_account && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 rounded-md hover:bg-muted/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: "Account"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 886,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-mono tabular",
                                            children: partner.bank_account
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 887,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 885,
                                    columnNumber: 17
                                }, this),
                                partner.bank_iban && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 rounded-md hover:bg-muted/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: "IBAN"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 892,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-mono tabular",
                                            children: partner.bank_iban
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 893,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 891,
                                    columnNumber: 17
                                }, this),
                                partner.bank_swift && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "p-2 rounded-md hover:bg-muted/30",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: "SWIFT / BIC"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 898,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm font-mono tabular",
                                            children: partner.bank_swift
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 899,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 897,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 877,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 873,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "deals",
                        className: "mt-3",
                        children: deals.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-muted-foreground py-4 text-center",
                            children: "No deals yet."
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 908,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: deals.map((d)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center justify-between p-2 rounded-md border border-border/60",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-medium truncate",
                                                    children: d.title
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 914,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-muted-foreground capitalize",
                                                    children: [
                                                        d.stage,
                                                        " · ",
                                                        (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtDate"])(d.expected_close)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 915,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 913,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-sm font-mono tabular",
                                            children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtMoney"])(d.value, d.currency)
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 917,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, d.id, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 912,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 910,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 906,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$tabs$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TabsContent"], {
                        value: "portal",
                        className: "space-y-4 mt-3",
                        children: portalQuery.isLoading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                                    className: "h-24 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 928,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
                                    className: "h-32 w-full"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 929,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 927,
                            columnNumber: 13
                        }, this) : portalAccess ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    className: "border-border/60 shadow-soft rounded-xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-4 space-y-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center justify-between",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2",
                                                        children: [
                                                            (()=>{
                                                                const Icon = PORTAL_STATUS_ICON[portalAccess.status];
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                                                    className: "size-5"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 938,
                                                                    columnNumber: 94
                                                                }, this);
                                                            })(),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm font-medium",
                                                                        children: "Portal Status"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 940,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: PORTAL_STATUS_LABELS[portalAccess.status]
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 941,
                                                                        columnNumber: 25
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 939,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 937,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                        variant: PORTAL_STATUS_BADGE[portalAccess.status],
                                                        className: "text-sm px-3 py-1",
                                                        children: PORTAL_STATUS_LABELS[portalAccess.status]
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 944,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 936,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 text-sm",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                className: `size-4 ${portalAccess.status !== "pending_approval" ? "text-emerald-500" : "text-muted-foreground"}`
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 952,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: portalAccess.status === "pending_approval" ? "text-muted-foreground" : "",
                                                                children: "Approved"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 953,
                                                                columnNumber: 23
                                                            }, this),
                                                            portalAccess.approved_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-muted-foreground ml-auto",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtDate"])(portalAccess.approved_at)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 954,
                                                                columnNumber: 52
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 951,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 text-sm",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                                className: `size-4 ${[
                                                                    "invited",
                                                                    "active"
                                                                ].includes(portalAccess.status) ? "text-emerald-500" : "text-muted-foreground"}`
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 957,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: ![
                                                                    "invited",
                                                                    "active"
                                                                ].includes(portalAccess.status) ? "text-muted-foreground" : "",
                                                                children: "Invite Sent"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 958,
                                                                columnNumber: 23
                                                            }, this),
                                                            portalAccess.invited_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-muted-foreground ml-auto",
                                                                children: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtDate"])(portalAccess.invited_at)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 959,
                                                                columnNumber: 51
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 956,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-2 text-sm",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                className: `size-4 ${portalAccess.status === "active" ? "text-emerald-500" : "text-muted-foreground"}`
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 962,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: portalAccess.status !== "active" ? "text-muted-foreground" : "",
                                                                children: "Active"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 963,
                                                                columnNumber: 23
                                                            }, this),
                                                            portalAccess.last_login_at && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xs text-muted-foreground ml-auto",
                                                                children: [
                                                                    "Last login ",
                                                                    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtRelative"])(portalAccess.last_login_at)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 964,
                                                                columnNumber: 54
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 961,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 950,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 935,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 934,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    className: "border-border/60 shadow-soft rounded-xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-4 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
                                                children: "Portal Details"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 973,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 rounded-md bg-muted/30",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: "Portal Email"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 976,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-medium",
                                                                children: portalAccess.portal_email || "—"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 977,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 975,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 rounded-md bg-muted/30",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: "Tier"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 980,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-medium",
                                                                children: TIER_INFO[portalAccess.tier].label
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 981,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 979,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 rounded-md bg-muted/30",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: "Welcome Email"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 984,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-medium",
                                                                children: portalAccess.welcome_email_sent ? "Sent" : "Not sent"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 985,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 983,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-2 rounded-md bg-muted/30",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: "Password Set"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 988,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-medium",
                                                                children: portalAccess.must_set_password ? "Pending" : "Yes"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 989,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 987,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 974,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 972,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 971,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        !portalAccess.welcome_email_sent && portalAccess.status !== "active" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            className: "w-full",
                                            onClick: handleSendInvite,
                                            disabled: sendingInvite || sendInviteMut.isPending,
                                            children: [
                                                sendingInvite || sendInviteMut.isPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "size-4 mr-2 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 1005,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                    className: "size-4 mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 1007,
                                                    columnNumber: 23
                                                }, this),
                                                "Send Invite Email"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 999,
                                            columnNumber: 19
                                        }, this),
                                        portalAccess.welcome_email_sent && portalAccess.status !== "active" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                            variant: "outline",
                                            className: "w-full",
                                            onClick: handleSendInvite,
                                            disabled: sendingInvite || sendInviteMut.isPending,
                                            children: [
                                                sendingInvite || sendInviteMut.isPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                    className: "size-4 mr-2 animate-spin"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 1022,
                                                    columnNumber: 23
                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                    className: "size-4 mr-2"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 1024,
                                                    columnNumber: 23
                                                }, this),
                                                "Re-send Invite Email"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1015,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 996,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    className: "border-border/60 shadow-soft rounded-xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-4 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                                                        className: "size-4 text-muted-foreground"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1035,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
                                                        children: "Test Portal Login"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1036,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1034,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 rounded-md bg-muted/30 space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: "Portal Email"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1040,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center gap-1",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-sm font-mono",
                                                                        children: portalAccess.portal_email || "—"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1042,
                                                                        columnNumber: 25
                                                                    }, this),
                                                                    portalAccess.portal_email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        onClick: ()=>copyToClipboard(portalAccess.portal_email, "email"),
                                                                        className: "text-muted-foreground hover:text-foreground smooth",
                                                                        title: "Copy email",
                                                                        children: copiedEmail ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                            className: "size-3.5 text-green-600"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1050,
                                                                            columnNumber: 44
                                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                                            className: "size-3.5"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1050,
                                                                            columnNumber: 92
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1044,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1041,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1039,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: "Status"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1056,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                variant: PORTAL_STATUS_BADGE[portalAccess.status],
                                                                className: "text-xs",
                                                                children: PORTAL_STATUS_LABELS[portalAccess.status]
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1057,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1055,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center justify-between",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-xs text-muted-foreground",
                                                                children: "Password Set"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1062,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-medium",
                                                                children: portalAccess.must_set_password ? "No" : "Yes"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1063,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1061,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1038,
                                                columnNumber: 19
                                            }, this),
                                            testPassword && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "p-3 rounded-lg border border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-800 space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-medium text-green-800 dark:text-green-300",
                                                        children: "Test Credentials"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1070,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: "Email"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1073,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                        className: "text-xs font-mono",
                                                                        children: portalAccess.portal_email
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1074,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1072,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: "Password"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1077,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center gap-1",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("code", {
                                                                                className: "text-xs font-mono",
                                                                                children: testPassword
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                lineNumber: 1079,
                                                                                columnNumber: 29
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                type: "button",
                                                                                onClick: ()=>copyToClipboard(testPassword, "pwd"),
                                                                                className: "text-muted-foreground hover:text-foreground smooth",
                                                                                title: "Copy password",
                                                                                children: copiedPwd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                                    className: "size-3.5 text-green-600"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1086,
                                                                                    columnNumber: 44
                                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$copy$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Copy$3e$__["Copy"], {
                                                                                    className: "size-3.5"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1086,
                                                                                    columnNumber: 92
                                                                                }, this)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                lineNumber: 1080,
                                                                                columnNumber: 29
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1078,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1076,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1071,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1069,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "outline",
                                                        className: "w-full",
                                                        onClick: handleSetTestPassword,
                                                        disabled: settingTestPwd,
                                                        children: [
                                                            settingTestPwd ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                                className: "size-4 mr-2 animate-spin"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1103,
                                                                columnNumber: 25
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                                                                className: "size-4 mr-2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1105,
                                                                columnNumber: 25
                                                            }, this),
                                                            testPassword ? "Reset Test Password" : "Set Test Password"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1096,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "outline",
                                                        className: "w-full",
                                                        onClick: ()=>copyToClipboard(portalLoginUrl, "url"),
                                                        children: [
                                                            copiedUrl ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Check$3e$__["Check"], {
                                                                className: "size-4 mr-2 text-green-600"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1117,
                                                                columnNumber: 25
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Link$3e$__["Link"], {
                                                                className: "size-4 mr-2"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1119,
                                                                columnNumber: 25
                                                            }, this),
                                                            copiedUrl ? "Copied!" : "Copy Portal Login URL"
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1111,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        variant: "outline",
                                                        className: "w-full",
                                                        asChild: true,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("a", {
                                                            href: `/portal/login?email=${encodeURIComponent(portalAccess.portal_email || "")}`,
                                                            target: "_blank",
                                                            rel: "noopener noreferrer",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$external$2d$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ExternalLink$3e$__["ExternalLink"], {
                                                                    className: "size-4 mr-2"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1131,
                                                                    columnNumber: 25
                                                                }, this),
                                                                "Open Portal Login"
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1126,
                                                            columnNumber: 23
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1125,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1094,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1033,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 1032,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                                    className: "border-border/60 shadow-soft rounded-xl",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                        className: "p-4 space-y-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-center gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$message$2d$square$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__MessageSquare$3e$__["MessageSquare"], {
                                                        className: "size-4 text-primary"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1143,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs font-medium text-muted-foreground uppercase tracking-wider",
                                                        children: "Portal Messages"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1144,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1142,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PortalMessageThread, {
                                                accessId: portalAccess.id,
                                                partnerId: partner.id,
                                                tenantId: partner.tenant_id,
                                                refreshKey: messageRefreshKey
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1148,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: adminMessage,
                                                        onChange: (e)=>setAdminMessage(e.target.value),
                                                        placeholder: "Type a message to the client…",
                                                        disabled: sendingMessage
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1152,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                                        size: "sm",
                                                        onClick: async ()=>{
                                                            if (!adminMessage.trim() || !portalAccess.id) return;
                                                            setSendingMessage(true);
                                                            try {
                                                                const r = await fetch(api(`/api/portal-access/${portalAccess.id}/message`), {
                                                                    method: "POST",
                                                                    headers: {
                                                                        "Content-Type": "application/json"
                                                                    },
                                                                    body: JSON.stringify({
                                                                        message: adminMessage.trim(),
                                                                        send_email: false
                                                                    })
                                                                });
                                                                if (!r.ok) {
                                                                    const e = await r.json().catch(()=>({}));
                                                                    throw new Error(e.error || "Failed");
                                                                }
                                                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success("Message sent to portal client.");
                                                                setAdminMessage("");
                                                                // Refresh message thread
                                                                setMessageRefreshKey((k)=>k + 1);
                                                            } catch (e) {
                                                                __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(e.message || "Failed to send message.");
                                                            } finally{
                                                                setSendingMessage(false);
                                                            }
                                                        },
                                                        disabled: sendingMessage || !adminMessage.trim(),
                                                        children: sendingMessage ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                                            className: "size-4 animate-spin"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1185,
                                                            columnNumber: 41
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$send$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Send$3e$__["Send"], {
                                                            className: "size-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1185,
                                                            columnNumber: 87
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1158,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1151,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1141,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 1140,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true) : /* No portal access yet */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Card"], {
                            className: "border-border/60 shadow-soft rounded-xl",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$card$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CardContent"], {
                                className: "p-6 text-center space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mx-auto w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$key$2d$round$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__KeyRound$3e$__["KeyRound"], {
                                            className: "size-8 text-muted-foreground"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1196,
                                            columnNumber: 19
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1195,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-medium",
                                                children: "No Portal Access"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1199,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-muted-foreground mt-1",
                                                children: "Activate the portal to allow this partner to view offers, submit RFQs, and manage their account online."
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1200,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1198,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        onClick: ()=>setShowActivateDialog(true),
                                        size: "lg",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                className: "size-4 mr-2"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1205,
                                                columnNumber: 19
                                            }, this),
                                            "Activate Portal"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1204,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 1194,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 1193,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 925,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 754,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
                open: showActivateDialog,
                onOpenChange: setShowActivateDialog,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
                    className: "sm:max-w-lg",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                            className: "size-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1219,
                                            columnNumber: 15
                                        }, this),
                                        "Activate Portal Access"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 1218,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                                    children: [
                                        "Create a portal account for ",
                                        partner.name,
                                        ". They'll receive an invite email to set up their password."
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 1222,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 1217,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-5 py-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            htmlFor: "portal-email",
                                            children: "Portal Email"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1230,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                            id: "portal-email",
                                            type: "email",
                                            value: portalEmail,
                                            onChange: (e)=>setPortalEmail(e.target.value),
                                            placeholder: "partner@company.com"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1231,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-xs text-muted-foreground",
                                            children: "This email will be used for portal login. Auto-filled from partner email."
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1238,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 1229,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                            children: "Access Tier"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1245,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "space-y-2",
                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$portal$2f$tiers$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ORDERED_TIERS"].map((meta)=>{
                                                const tier = meta.value;
                                                const info = TIER_INFO[tier];
                                                const isSelected = portalTier === tier;
                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    onClick: ()=>setPortalTier(tier),
                                                    className: `w-full text-left p-3 rounded-lg border-2 transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border hover:bg-muted/30"}`,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "font-medium text-sm",
                                                                    children: info.label
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1263,
                                                                    columnNumber: 25
                                                                }, this),
                                                                isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$circle$2d$check$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__CheckCircle2$3e$__["CheckCircle2"], {
                                                                    className: "size-4 text-primary"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1265,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1262,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                            className: "text-xs text-muted-foreground mt-0.5",
                                                            children: info.description
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1268,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-wrap gap-1 mt-2",
                                                            children: info.features.map((f)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                                    variant: isSelected ? "secondary" : "outline",
                                                                    className: "text-[10px] px-1.5 py-0",
                                                                    children: f
                                                                }, f, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1271,
                                                                    columnNumber: 27
                                                                }, this))
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1269,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, tier, true, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 1252,
                                                    columnNumber: 21
                                                }, this);
                                            })
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1246,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 1244,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 1227,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                            className: "gap-2 sm:gap-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    variant: "outline",
                                    onClick: ()=>setShowActivateDialog(false),
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 1284,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                    onClick: handleActivatePortal,
                                    disabled: createPortalMut.isPending || !portalEmail.trim(),
                                    children: [
                                        createPortalMut.isPending ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$loader$2d$circle$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Loader2$3e$__["Loader2"], {
                                            className: "size-4 mr-2 animate-spin"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1292,
                                            columnNumber: 17
                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                            className: "size-4 mr-2"
                                        }, void 0, false, {
                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                            lineNumber: 1294,
                                            columnNumber: 17
                                        }, this),
                                        "Create & Invite"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                    lineNumber: 1287,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 1283,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 1216,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 1215,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/views/partners-view.tsx",
        lineNumber: 711,
        columnNumber: 5
    }, this);
}
_s1(PartnerDetail, "8g7ShvTWlJanyYOo9H8gg3ZSM9k=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiUrl"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenantKey"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQueryClient"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useQuery$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useQuery"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$useMutation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMutation"]
    ];
});
_c1 = PartnerDetail;
// ---- Visual type buttons for the form ----
const TYPE_BUTTONS = [
    {
        value: "buyer",
        label: "Buyer",
        description: "Buys from you",
        icon: "🛒"
    },
    {
        value: "supplier",
        label: "Supplier",
        description: "Sells to you",
        icon: "📦"
    },
    {
        value: "both",
        label: "Both",
        description: "Buyer & supplier",
        icon: "🔄"
    },
    {
        value: "agent",
        label: "Agent",
        description: "Commission agent",
        icon: "💼"
    }
];
const OTHER_TYPES = [
    {
        value: "logistics",
        label: "Logistics Provider"
    },
    {
        value: "customs",
        label: "Customs Broker"
    },
    {
        value: "bank",
        label: "Bank / Financial"
    },
    {
        value: "inspector",
        label: "Inspection Agency"
    }
];
// ---- Form dialog ----
function PartnerFormDialog({ open, onOpenChange, partner, onSaved }) {
    _s2();
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiUrl"])();
    const tenantKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenantKey"])();
    const [form, setForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showOtherTypes, setShowOtherTypes] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [moreOpen, setMoreOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [quickCreate, setQuickCreate] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const isEditing = !!partner;
    // Fix: use useEffect instead of useMemo for side effects
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PartnerFormDialog.useEffect": ()=>{
            if (open) {
                if (partner) {
                    setForm({
                        ...partner
                    });
                    setShowOtherTypes([
                        "logistics",
                        "customs",
                        "bank",
                        "inspector"
                    ].includes(partner.type));
                    // When editing, open "More Details" if any advanced field has data
                    const hasAdvanced = partner.address_line || partner.city || partner.tax_id || partner.bank_name || partner.bank_account || partner.notes || partner.portal_enabled || partner.is_commissioner || partner.contact_name || partner.contact_email;
                    setMoreOpen(!!hasAdvanced);
                    setQuickCreate(false);
                } else {
                    setForm({
                        type: "buyer",
                        status: "active",
                        risk_score: 0,
                        preferred_currency: "USD",
                        entity_type: "company",
                        preferred_payment_terms: "net30",
                        portal_enabled: false,
                        portal_level: "none",
                        kyc_status: "not_submitted"
                    });
                    setShowOtherTypes(false);
                    setMoreOpen(false);
                    setQuickCreate(true);
                }
            }
        }
    }["PartnerFormDialog.useEffect"], [
        open,
        partner
    ]);
    function set(k, v) {
        setForm((f)=>({
                ...f,
                [k]: v
            }));
    }
    // Auto-generate partner code from name
    const handleNameChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "PartnerFormDialog.useCallback[handleNameChange]": (name)=>{
            set("name", name);
            if (!isEditing && name.trim()) {
                // Auto-generate code from name
                const code = generatePartnerCode(name);
                if (code) {
                    set("tax_id", code);
                }
            }
        }
    }["PartnerFormDialog.useCallback[handleNameChange]"], [
        isEditing
    ]);
    async function save() {
        if (!form.name?.trim()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Name is required.");
            return;
        }
        if (quickCreate && !form.email?.trim()) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error("Email is required for Quick Create.");
            return;
        }
        setSaving(true);
        try {
            const method = partner ? "PUT" : "POST";
            const url = partner ? api(`/api/partners/${partner.id}`) : api("/api/partners");
            const payload = {
                ...form,
                risk_score: form.risk_score ?? 0,
                name: form.name.trim()
            };
            const r = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (!r.ok) {
                const e = await r.json().catch(()=>({}));
                throw new Error(e.error || "Request failed");
            }
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].success(partner ? "Partner updated." : `"${form.name}" created successfully!`);
            onSaved();
        } catch (e) {
            __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["toast"].error(e.message || "Saving failed.");
        } finally{
            setSaving(false);
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Dialog"], {
        open: open,
        onOpenChange: onOpenChange,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogContent"], {
            size: "xl",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogHeader"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogTitle"], {
                            children: partner ? "Edit partner" : "New partner"
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 1412,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogDescription"], {
                            children: partner ? "Update partner information." : quickCreate ? "Just the basics — name and email to get started." : "Add detailed partner information."
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 1413,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 1411,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-h-[70vh] overflow-y-auto pr-1 custom-scroll",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "space-y-4 py-2",
                        children: [
                            !isEditing && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-2 p-2 rounded-lg bg-muted/30",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        variant: quickCreate ? "default" : "ghost",
                                        onClick: ()=>setQuickCreate(true),
                                        className: "gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$zap$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Zap$3e$__["Zap"], {
                                                className: "size-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1430,
                                                columnNumber: 19
                                            }, this),
                                            "Quick Create"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1424,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                                        size: "sm",
                                        variant: !quickCreate ? "default" : "ghost",
                                        onClick: ()=>setQuickCreate(false),
                                        className: "gap-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$building$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Building2$3e$__["Building2"], {
                                                className: "size-3.5"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1439,
                                                columnNumber: 19
                                            }, this),
                                            "Full Form"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1433,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 1423,
                                columnNumber: 15
                            }, this),
                            quickCreate && !isEditing ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                htmlFor: "quick-name",
                                                children: "Partner Name *"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1450,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                id: "quick-name",
                                                value: form.name || "",
                                                onChange: (e)=>handleNameChange(e.target.value),
                                                placeholder: "Acme Trading Ltd.",
                                                className: "text-lg",
                                                autoFocus: true
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1451,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1449,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                children: "Partner Type"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1463,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-2 gap-2",
                                                children: TYPE_BUTTONS.map((t)=>{
                                                    const isSelected = form.type === t.value && !showOtherTypes;
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>{
                                                            set("type", t.value);
                                                            setShowOtherTypes(false);
                                                            if (t.value === "agent") {
                                                                set("is_commissioner", true);
                                                            } else {
                                                                set("is_commissioner", false);
                                                            }
                                                        },
                                                        className: `flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border hover:bg-muted/30"}`,
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "text-xl",
                                                                children: t.icon
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1486,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: `font-medium text-sm ${isSelected ? "text-primary" : ""}`,
                                                                        children: t.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1488,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: "text-xs text-muted-foreground",
                                                                        children: t.description
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1489,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1487,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, t.value, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1468,
                                                        columnNumber: 25
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1464,
                                                columnNumber: 19
                                            }, this),
                                            !showOtherTypes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>setShowOtherTypes(true),
                                                className: "text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline",
                                                children: "Other types (logistics, customs, bank, inspector)…"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1497,
                                                columnNumber: 21
                                            }, this),
                                            showOtherTypes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        children: "Specific Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1507,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                        value: form.type || "logistics",
                                                        onValueChange: (v)=>set("type", v),
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                    placeholder: "Select type"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1509,
                                                                    columnNumber: 40
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1509,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                children: OTHER_TYPES.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                        value: t.value,
                                                                        children: t.label
                                                                    }, t.value, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1511,
                                                                        columnNumber: 51
                                                                    }, this))
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1510,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1508,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1506,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1462,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                htmlFor: "quick-email",
                                                children: "Email *"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1520,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                id: "quick-email",
                                                type: "email",
                                                value: form.email || "",
                                                onChange: (e)=>set("email", e.target.value),
                                                placeholder: "contact@company.com"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1521,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1519,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                htmlFor: "quick-phone",
                                                children: [
                                                    "Phone ",
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-muted-foreground",
                                                        children: "(optional)"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1532,
                                                        columnNumber: 54
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1532,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                id: "quick-phone",
                                                value: form.phone || "",
                                                onChange: (e)=>set("phone", e.target.value),
                                                placeholder: "+1 555 123 4567"
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1533,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1531,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/components/views/partners-view.tsx",
                                lineNumber: 1447,
                                columnNumber: 15
                            }, this) : /* === Full Form Mode / Edit Mode === */ /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "md:col-span-2 space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        children: "Partner Name *"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1546,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: form.name || "",
                                                        onChange: (e)=>handleNameChange(e.target.value),
                                                        placeholder: "Acme Trading Ltd."
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1547,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1545,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "md:col-span-2 space-y-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        children: "Type"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1552,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "grid grid-cols-4 gap-2",
                                                        children: TYPE_BUTTONS.map((t)=>{
                                                            const isSelected = form.type === t.value && !showOtherTypes;
                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>{
                                                                    set("type", t.value);
                                                                    setShowOtherTypes(false);
                                                                    if (t.value === "agent") {
                                                                        set("is_commissioner", true);
                                                                    } else {
                                                                        set("is_commissioner", false);
                                                                    }
                                                                },
                                                                className: `flex flex-col items-center gap-1 p-2.5 rounded-lg border-2 transition-all ${isSelected ? "border-primary bg-primary/5 shadow-sm" : "border-border/60 hover:border-border hover:bg-muted/30"}`,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "text-lg",
                                                                        children: t.icon
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1575,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                        className: `text-xs font-medium ${isSelected ? "text-primary" : ""}`,
                                                                        children: t.label
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1576,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, t.value, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1557,
                                                                columnNumber: 27
                                                            }, this);
                                                        })
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1553,
                                                        columnNumber: 21
                                                    }, this),
                                                    !showOtherTypes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>setShowOtherTypes(true),
                                                        className: "text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline",
                                                        children: "Other types…"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1583,
                                                        columnNumber: 23
                                                    }, this),
                                                    showOtherTypes && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "space-y-1.5",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                children: "Specific Type"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1593,
                                                                columnNumber: 25
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                                value: form.type || "logistics",
                                                                onValueChange: (v)=>set("type", v),
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                            placeholder: "Select type"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1595,
                                                                            columnNumber: 42
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1595,
                                                                        columnNumber: 27
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                        children: OTHER_TYPES.map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                value: t.value,
                                                                                children: t.label
                                                                            }, t.value, false, {
                                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                lineNumber: 1597,
                                                                                columnNumber: 53
                                                                            }, this))
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                                        lineNumber: 1596,
                                                                        columnNumber: 27
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                lineNumber: 1594,
                                                                columnNumber: 25
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1592,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1551,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        children: "Email"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1605,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        type: "email",
                                                        value: form.email || "",
                                                        onChange: (e)=>set("email", e.target.value),
                                                        placeholder: "contact@company.com"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1606,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1604,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "space-y-1.5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                        children: "Phone"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1609,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                        value: form.phone || "",
                                                        onChange: (e)=>set("phone", e.target.value),
                                                        placeholder: "+1 555 123 4567"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                                        lineNumber: 1610,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1608,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1544,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Collapsible"], {
                                        open: moreOpen,
                                        onOpenChange: setMoreOpen,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleTrigger"], {
                                                asChild: true,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    className: "flex items-center gap-2 w-full py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors",
                                                    children: [
                                                        moreOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronDown$3e$__["ChevronDown"], {
                                                            className: "size-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1621,
                                                            columnNumber: 35
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$chevron$2d$right$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ChevronRight$3e$__["ChevronRight"], {
                                                            className: "size-4"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1621,
                                                            columnNumber: 72
                                                        }, this),
                                                        "More Details",
                                                        !moreOpen && (form.address_line || form.city || form.tax_id || form.bank_name || form.notes || form.contact_name) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$badge$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Badge"], {
                                                            variant: "secondary",
                                                            className: "text-[10px] px-1.5 py-0",
                                                            children: "Filled"
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1624,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 1617,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1616,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$collapsible$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CollapsibleContent"], {
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-4 pt-1 pb-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2",
                                                                    children: "Address & Trade"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1633,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Status"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1636,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                                                    value: form.status || "active",
                                                                                    onValueChange: (v)=>set("status", v),
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {}, void 0, false, {
                                                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                lineNumber: 1638,
                                                                                                columnNumber: 46
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1638,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                                            children: [
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                                    value: "active",
                                                                                                    children: "Active"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                    lineNumber: 1640,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                                    value: "inactive",
                                                                                                    children: "Inactive"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                    lineNumber: 1641,
                                                                                                    columnNumber: 33
                                                                                                }, this),
                                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                                    value: "blacklisted",
                                                                                                    children: "Blacklisted"
                                                                                                }, void 0, false, {
                                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                    lineNumber: 1642,
                                                                                                    columnNumber: 33
                                                                                                }, this)
                                                                                            ]
                                                                                        }, void 0, true, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1639,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1637,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1635,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Entity Type"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1647,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                                                    value: form.entity_type || "company",
                                                                                    onValueChange: (v)=>set("entity_type", v),
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                                                placeholder: "Select entity type"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                lineNumber: 1649,
                                                                                                columnNumber: 46
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1649,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$reference$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ENTITY_TYPES"].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                                    value: t.value,
                                                                                                    children: t.label
                                                                                                }, t.value, false, {
                                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                    lineNumber: 1651,
                                                                                                    columnNumber: 58
                                                                                                }, this))
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1650,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1648,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1646,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Tax ID"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1656,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.tax_id || "",
                                                                                    onChange: (e)=>set("tax_id", e.target.value),
                                                                                    placeholder: "e.g. VAT number"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1657,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1655,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "VAT Number"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1660,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.vat_number || "",
                                                                                    onChange: (e)=>set("vat_number", e.target.value),
                                                                                    placeholder: "e.g. EU VAT number"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1661,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1659,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Registration No."
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1664,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.registration_number || "",
                                                                                    onChange: (e)=>set("registration_number", e.target.value),
                                                                                    placeholder: "Company registration number"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1665,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1663,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Website"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1668,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.website || "",
                                                                                    onChange: (e)=>set("website", e.target.value),
                                                                                    placeholder: "https://"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1669,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1667,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Currency"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1672,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                                                    value: form.preferred_currency || "USD",
                                                                                    onValueChange: (v)=>set("preferred_currency", v),
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                                                placeholder: "Select currency"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                lineNumber: 1674,
                                                                                                columnNumber: 46
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1674,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                                            className: "max-h-72",
                                                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$reference$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CURRENCIES"].map((c)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                                    value: c.value,
                                                                                                    children: c.label
                                                                                                }, c.value, false, {
                                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                    lineNumber: 1676,
                                                                                                    columnNumber: 56
                                                                                                }, this))
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1675,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1673,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1671,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Payment Terms"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1681,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Select"], {
                                                                                    value: form.preferred_payment_terms || "net30",
                                                                                    onValueChange: (v)=>set("preferred_payment_terms", v),
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectTrigger"], {
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectValue"], {
                                                                                                placeholder: "Select payment terms"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                lineNumber: 1683,
                                                                                                columnNumber: 46
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1683,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectContent"], {
                                                                                            children: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$reference$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAYMENT_TERMS_LOCAL"].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SelectItem"], {
                                                                                                    value: t.value,
                                                                                                    children: t.label
                                                                                                }, t.value, false, {
                                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                                    lineNumber: 1685,
                                                                                                    columnNumber: 65
                                                                                                }, this))
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1684,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1682,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1680,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "md:col-span-2 space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Address"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1690,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.address_line || "",
                                                                                    onChange: (e)=>set("address_line", e.target.value),
                                                                                    placeholder: "Street and number"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1691,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1689,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "City"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1694,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.city || "",
                                                                                    onChange: (e)=>set("city", e.target.value)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1695,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1693,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "State / Region"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1698,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.state || "",
                                                                                    onChange: (e)=>set("state", e.target.value)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1699,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1697,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Postal code"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1702,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.postal_code || "",
                                                                                    onChange: (e)=>set("postal_code", e.target.value)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1703,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1701,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Country"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1706,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$searchable$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SearchableSelect"], {
                                                                                    options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$geo$2f$countries$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCountriesForSelect"])(),
                                                                                    value: form.country || "",
                                                                                    onChange: (v)=>set("country", v),
                                                                                    placeholder: "Select country…",
                                                                                    searchPlaceholder: "Search countries…",
                                                                                    clearable: true
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1707,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1705,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "City"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1717,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                form.country ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$searchable$2d$select$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SearchableSelect"], {
                                                                                    options: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$data$2f$geo$2f$countries$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getCitiesForSelect"])(form.country),
                                                                                    value: form.city || "",
                                                                                    onChange: (v)=>set("city", v),
                                                                                    placeholder: "Select city…",
                                                                                    searchPlaceholder: "Search cities…",
                                                                                    clearable: true
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1719,
                                                                                    columnNumber: 31
                                                                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.city || "",
                                                                                    onChange: (e)=>set("city", e.target.value),
                                                                                    placeholder: "Select country first…"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1728,
                                                                                    columnNumber: 31
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1716,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1634,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1632,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2",
                                                                    children: "Contact Person"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1740,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Name"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1743,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.contact_name || "",
                                                                                    onChange: (e)=>set("contact_name", e.target.value),
                                                                                    placeholder: "John Doe"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1744,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1742,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Email"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1747,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    type: "email",
                                                                                    value: form.contact_email || "",
                                                                                    onChange: (e)=>set("contact_email", e.target.value),
                                                                                    placeholder: "john@company.com"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1748,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1746,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Phone"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1751,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.contact_phone || "",
                                                                                    onChange: (e)=>set("contact_phone", e.target.value),
                                                                                    placeholder: "+1 555 123 4567"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1752,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1750,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1741,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1739,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2",
                                                                    children: "Bank Details"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1759,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "grid grid-cols-1 md:grid-cols-2 gap-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Bank Name"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1762,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.bank_name || "",
                                                                                    onChange: (e)=>set("bank_name", e.target.value),
                                                                                    placeholder: "e.g. Deutsche Bank"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1763,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1761,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Account"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1766,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.bank_account || "",
                                                                                    onChange: (e)=>set("bank_account", e.target.value),
                                                                                    placeholder: "IBAN or account number"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1767,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1765,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "IBAN"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1770,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.bank_iban || "",
                                                                                    onChange: (e)=>set("bank_iban", e.target.value),
                                                                                    placeholder: "e.g. DE89 3704 0044 0532 0130 00"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1771,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1769,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "SWIFT / BIC"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1774,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$input$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Input"], {
                                                                                    value: form.bank_swift || "",
                                                                                    onChange: (e)=>set("bank_swift", e.target.value),
                                                                                    placeholder: "e.g. DEUTDEFF"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1775,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1773,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1760,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1758,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2",
                                                                    children: "Notes & Options"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1782,
                                                                    columnNumber: 25
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "space-y-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "space-y-1.5",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$label$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Label"], {
                                                                                    children: "Notes"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1785,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$textarea$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Textarea"], {
                                                                                    rows: 3,
                                                                                    value: form.notes || "",
                                                                                    onChange: (e)=>set("notes", e.target.value),
                                                                                    placeholder: "Any additional notes about this partner…"
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1786,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1784,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-3 p-3 rounded-md bg-muted/30",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                                                                    checked: !!form.portal_enabled,
                                                                                    onCheckedChange: (v)=>set("portal_enabled", v)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1790,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-sm font-medium",
                                                                                            children: "Portal access"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1792,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-xs text-muted-foreground",
                                                                                            children: "Allow partner portal access."
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1793,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1791,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1789,
                                                                            columnNumber: 27
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "flex items-center gap-3 p-3 rounded-md bg-primary/5 border border-primary/20",
                                                                            children: [
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$switch$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Switch"], {
                                                                                    checked: !!form.is_commissioner,
                                                                                    onCheckedChange: (v)=>set("is_commissioner", v)
                                                                                }, void 0, false, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1798,
                                                                                    columnNumber: 29
                                                                                }, this),
                                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                    children: [
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-sm font-medium text-primary",
                                                                                            children: "Commission Agent"
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1800,
                                                                                            columnNumber: 31
                                                                                        }, this),
                                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                            className: "text-xs text-muted-foreground",
                                                                                            children: "Mark this partner as a commission agent who earns from deals they introduce."
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                            lineNumber: 1801,
                                                                                            columnNumber: 31
                                                                                        }, this)
                                                                                    ]
                                                                                }, void 0, true, {
                                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                                    lineNumber: 1799,
                                                                                    columnNumber: 29
                                                                                }, this)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                                            lineNumber: 1797,
                                                                            columnNumber: 27
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                                    lineNumber: 1783,
                                                                    columnNumber: 25
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/components/views/partners-view.tsx",
                                                            lineNumber: 1781,
                                                            columnNumber: 23
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/components/views/partners-view.tsx",
                                                    lineNumber: 1629,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/components/views/partners-view.tsx",
                                                lineNumber: 1628,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/components/views/partners-view.tsx",
                                        lineNumber: 1615,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 1419,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 1418,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$dialog$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DialogFooter"], {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            variant: "outline",
                            onClick: ()=>onOpenChange(false),
                            children: "Cancel"
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 1816,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$button$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Button"], {
                            onClick: save,
                            disabled: saving,
                            children: saving ? "Saving…" : partner ? "Save changes" : quickCreate ? "Create partner" : "Create partner"
                        }, void 0, false, {
                            fileName: "[project]/src/components/views/partners-view.tsx",
                            lineNumber: 1817,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/views/partners-view.tsx",
                    lineNumber: 1815,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/views/partners-view.tsx",
            lineNumber: 1410,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/components/views/partners-view.tsx",
        lineNumber: 1409,
        columnNumber: 5
    }, this);
}
_s2(PartnerFormDialog, "kAWmngLurLqYl3E+OQIfcIyInNQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiUrl"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenantKey"]
    ];
});
_c2 = PartnerFormDialog;
// ─── Portal Message Thread (admin side) ───────────────────────────────
function PortalMessageThread({ accessId, partnerId, tenantId, refreshKey }) {
    _s3();
    const api = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiUrl"])();
    const tenantKey = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenantKey"])();
    const [messages, setMessages] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PortalMessageThread.useEffect": ()=>{
            let mounted = true;
            // Use a microtask to avoid calling setState synchronously in the effect body
            queueMicrotask({
                "PortalMessageThread.useEffect": ()=>{
                    if (mounted) setLoading(true);
                }
            }["PortalMessageThread.useEffect"]);
            fetch(api(`/api/audit?limit=100&entity_type=portal_access`)).then({
                "PortalMessageThread.useEffect": (r)=>r.json()
            }["PortalMessageThread.useEffect"]).then({
                "PortalMessageThread.useEffect": (data)=>{
                    if (!mounted) return;
                    const items = (data.items || []).filter({
                        "PortalMessageThread.useEffect.items": (a)=>(a.action === "portal.message" || a.action === "admin.message") && (a.entity_id === accessId || a.details?.partner_id === partnerId || a.details?.access_id === accessId)
                    }["PortalMessageThread.useEffect.items"]);
                    const mapped = items.map({
                        "PortalMessageThread.useEffect.mapped": (a)=>({
                                id: a.id,
                                direction: a.action === "portal.message" ? "incoming" : "outgoing",
                                message: a.details?.message || "",
                                sender: a.username || "System",
                                timestamp: a.created_at
                            })
                    }["PortalMessageThread.useEffect.mapped"]).sort({
                        "PortalMessageThread.useEffect.mapped": (a, b)=>a.timestamp.localeCompare(b.timestamp)
                    }["PortalMessageThread.useEffect.mapped"]);
                    setMessages(mapped);
                }
            }["PortalMessageThread.useEffect"]).catch({
                "PortalMessageThread.useEffect": ()=>{
                    if (mounted) setMessages([]);
                }
            }["PortalMessageThread.useEffect"]).finally({
                "PortalMessageThread.useEffect": ()=>{
                    if (mounted) setLoading(false);
                }
            }["PortalMessageThread.useEffect"]);
            return ({
                "PortalMessageThread.useEffect": ()=>{
                    mounted = false;
                }
            })["PortalMessageThread.useEffect"];
        }
    }["PortalMessageThread.useEffect"], [
        accessId,
        partnerId,
        refreshKey
    ]);
    if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$ui$2f$skeleton$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Skeleton"], {
            className: "h-32 w-full rounded-lg"
        }, void 0, false, {
            fileName: "[project]/src/components/views/partners-view.tsx",
            lineNumber: 1883,
            columnNumber: 12
        }, this);
    }
    if (messages.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "text-center py-4 text-xs text-muted-foreground",
            children: "No messages yet. Send a message below to start a conversation."
        }, void 0, false, {
            fileName: "[project]/src/components/views/partners-view.tsx",
            lineNumber: 1888,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "max-h-48 overflow-y-auto space-y-2 pr-1",
        children: messages.map((msg)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex flex-col max-w-[85%] rounded-lg p-2 text-xs ${msg.direction === "outgoing" ? "ml-auto bg-primary text-primary-foreground" : "mr-auto bg-muted"}`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "leading-relaxed whitespace-pre-wrap",
                        children: msg.message
                    }, void 0, false, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 1905,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: `text-[9px] mt-1 ${msg.direction === "outgoing" ? "text-primary-foreground/60" : "text-muted-foreground"}`,
                        children: [
                            msg.sender,
                            " · ",
                            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$utils$2f$format$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["fmtRelative"])(msg.timestamp)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/views/partners-view.tsx",
                        lineNumber: 1906,
                        columnNumber: 11
                    }, this)
                ]
            }, msg.id, true, {
                fileName: "[project]/src/components/views/partners-view.tsx",
                lineNumber: 1897,
                columnNumber: 9
            }, this))
    }, void 0, false, {
        fileName: "[project]/src/components/views/partners-view.tsx",
        lineNumber: 1895,
        columnNumber: 5
    }, this);
}
_s3(PortalMessageThread, "rxen7xS6mZItmlLrIEIvzNBVpBI=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useApiUrl"],
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$hooks$2f$use$2d$api$2d$url$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useTenantKey"]
    ];
});
_c3 = PortalMessageThread;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "PartnersView");
__turbopack_context__.k.register(_c1, "PartnerDetail");
__turbopack_context__.k.register(_c2, "PartnerFormDialog");
__turbopack_context__.k.register(_c3, "PortalMessageThread");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/views/partners-view.tsx [app-client] (ecmascript, next/dynamic entry)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/components/views/partners-view.tsx [app-client] (ecmascript)"));
}),
]);

//# sourceMappingURL=src_dd97743e._.js.map