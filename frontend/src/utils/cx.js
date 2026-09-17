/** Junta classes ignorando valores falsy: cx("a", cond && "b") */
export const cx = (...classes) => classes.filter(Boolean).join(" ");
