import { useId } from "preact/hooks";
import type { ComponentProps } from "preact";

export function Switch(
	{ label, id = useId(), ...props }:
		& { label: string }
		& ComponentProps<"input">,
) {
	return (
		<label for={id} class="form-group">
			<span class="paper-switch-2">
				<input
					id={id}
					type="checkbox"
					role="switch"
					{...props}
				/>
				<span class="paper-switch-slider round" aria-hidden="true"></span>
			</span>
			<span class="paper-switch-2-label">
				{label}
			</span>
		</label>
	);
}
