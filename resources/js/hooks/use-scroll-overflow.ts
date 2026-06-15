import { RefObject, useLayoutEffect, useState } from 'react';

export function useScrollOverflow(ref: RefObject<HTMLElement | null>) {
    const [canScrollDown, setCanScrollDown] = useState(false);

    useLayoutEffect(() => {
        const el = ref.current;
        if (!el) return;

        const check = () => {
            setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 2);
        };

        check();
        el.addEventListener('scroll', check, { passive: true });

        const ro = new ResizeObserver(check);
        ro.observe(el);
        if (el.firstElementChild) {
            ro.observe(el.firstElementChild);
        }

        return () => {
            el.removeEventListener('scroll', check);
            ro.disconnect();
        };
    }, [ref]);

    return canScrollDown;
}
