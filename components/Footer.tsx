export function Footer({ num, latestNum }: { num: number; latestNum: number }) {
	return (
		<footer class="container container-sm margin-bottom">
			<nav class="paginator">
				{num > 1 && (
					<a href={`/${num - 1}`}>
						<span aria-hidden="true">«</span> Previous
					</a>
				)}
				<a href={`/${num}`} aria-current="page">{num}</a>
				{num < latestNum && (
					<a href={`/${num + 1}`}>
						Next <span aria-hidden="true">»</span>
					</a>
				)}
			</nav>
		</footer>
	);
}
