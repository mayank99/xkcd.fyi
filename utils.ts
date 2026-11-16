/** Thrown from a handler to render `routes/_error.tsx` with this status */
export class HttpError extends Error {
	constructor(public status: number) {
		super(`HTTP ${status}`);
	}
}

interface PageResponse<Data> {
	data: Data;
	/** For `<title>`, in `routes/_app.tsx` */
	title?: string;
	headers?: Record<string, string>;
}

/** A route's `handler`: `GET` returns `data` for the page component, plus response headers */
export interface Handlers<Data> {
	GET: (context: { params: Record<string, string> }) => Promise<PageResponse<Data>>;
}

export interface PageProps<Data> {
	data: Data;
}

/** `Data` returned by a route's `handler`, for `PageProps<DataOf<typeof handler>>` */
export type DataOf<H> = H extends Handlers<infer Data> ? Data : unknown;
