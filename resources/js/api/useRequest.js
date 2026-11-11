import { useCallback, useEffect, useRef, useState } from 'react';

// Runs fetcher on mount and whenever deps change; ignores stale responses.
export default function useRequest(fetcher, deps = []) {
    const [state, setState] = useState({ data: null, error: null, loading: true });
    const requestId = useRef(0);

    const run = useCallback(() => {
        const id = ++requestId.current;
        setState((previous) => ({ ...previous, loading: true, error: null }));
        return fetcher()
            .then((data) => {
                if (id === requestId.current) setState({ data, error: null, loading: false });
                return data;
            })
            .catch((error) => {
                if (id === requestId.current) setState((previous) => ({ ...previous, error, loading: false }));
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => {
        run();
        return () => {
            requestId.current++;
        };
    }, [run]);

    return { ...state, reload: run };
}
