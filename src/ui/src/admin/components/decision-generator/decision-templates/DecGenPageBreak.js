import React from "react";

export const PAGE_BREAK_CLASS = `dms_page_break`
export const PAGE_BREAK_STYLES = { msoSpecialCharacter:'line-break', pageBreakBefore: 'always' };
export const DecGenPageBreak = <>
    <br className={PAGE_BREAK_CLASS} clear="all" style={PAGE_BREAK_STYLES} />
    <br/>
</>;
