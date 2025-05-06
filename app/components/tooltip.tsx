import {
	useFloating,
	autoUpdate,
	offset,
	flip,
	shift,
	useHover,
	useFocus,
	useDismiss,
	useRole,
	useInteractions,
	FloatingPortal,
	arrow,
	FloatingArrow,
} from "@floating-ui/react";
import React from "react";

interface TooltipProps {
	content: React.ReactNode;
	children: React.ReactElement;
	placement?: "top" | "bottom" | "left" | "right";
	className?: string;
}

export function Tooltip({
	content,
	children,
	placement = "top",
	className,
}: TooltipProps) {
	const [isOpen, setIsOpen] = React.useState(false);
	const arrowRef = React.useRef(null);

	const { refs, floatingStyles, context } = useFloating({
		open: isOpen,
		onOpenChange: setIsOpen,
		placement,
		middleware: [offset(10), flip(), shift(), arrow({ element: arrowRef })],
		whileElementsMounted: autoUpdate,
	});

	const hover = useHover(context, { move: false });
	const focus = useFocus(context);
	const dismiss = useDismiss(context);
	const role = useRole(context, { role: "tooltip" });

	const { getReferenceProps, getFloatingProps } = useInteractions([
		hover,
		focus,
		dismiss,
		role,
	]);

	return (
		<>
			{React.cloneElement(children, {
				ref: refs.setReference,
				...getReferenceProps(),
			})}
			{isOpen && (
				<FloatingPortal>
					<div
						ref={refs.setFloating}
						style={floatingStyles}
						{...getFloatingProps()}
						className={`bg-zinc-50 dark:(bg-neutral-900 border-neutral-700) border border-neutral-200 text-secondary  text-sm rounded-xl px-2 py-1 ${className || ""}`}
					>
						{content}
						<FloatingArrow
							ref={arrowRef}
							context={context}
							className="fill-neutral-800"
						/>
					</div>
				</FloatingPortal>
			)}
		</>
	);
}
