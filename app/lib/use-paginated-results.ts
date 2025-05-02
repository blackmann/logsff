import React from "react";

export function usePaginatedResults<T>(
	fn: (prevResults: T[][]) => Promise<T[]>,
) {
	const [results, setResults] = React.useState<T[][]>([]);
	const [isLoading, setIsLoading] = React.useState(false);

	const previousResults = React.useRef<T[][]>([]);
	const isLoadingRef = React.useRef(false);

	const loadMore = React.useCallback(
		async (prevResults: T[][]) => {
			if (isLoadingRef.current) return;
			if (prevResults.at(-1)?.length === 0) return;

			setIsLoading(true);
			isLoadingRef.current = true;

			const newResults = await fn(prevResults);

			setResults((prev) => {
				const joined = [...prev, newResults];
				previousResults.current = joined;
				return joined;
			});

			setIsLoading(false);
      isLoadingRef.current = false
		},
		[fn],
	);

	const next = React.useCallback(() => {
		if (isLoadingRef.current) return;
		loadMore(previousResults.current);
	}, [loadMore]);

	React.useEffect(() => {
		loadMore(previousResults.current);
	}, [loadMore]);

	return { next, isLoading, results };
}
