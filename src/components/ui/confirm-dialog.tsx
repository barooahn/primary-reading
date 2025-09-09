"use client";

import { useState, type ReactNode } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";

interface ConfirmDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	title?: string;
	description?: ReactNode;
	confirmText?: string;
	cancelText?: string;
	variant?: "destructive" | "warning" | "default";
	loading?: boolean;
}

export function ConfirmDialog({
	isOpen,
	onClose,
	onConfirm,
	title = "Are you sure?",
	description = "This action cannot be undone.",
	confirmText = "Confirm",
	cancelText = "Cancel",
	variant = "destructive",
	loading = false,
}: ConfirmDialogProps) {
	const [isConfirming, setIsConfirming] = useState(false);

	const handleConfirm = async () => {
		setIsConfirming(true);
		try {
			await onConfirm();
		} catch (error) {
			console.error("Confirmation action failed:", error);
		} finally {
			setIsConfirming(false);
			onClose();
		}
	};

	const getIcon = () => {
		switch (variant) {
			case "destructive":
				return <Trash2 className='h-6 w-6 text-destructive' />;
			case "warning":
				return (
					<AlertTriangle className='h-6 w-6 text-yellow-500' />
				);
			default:
				return null;
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='sm:max-w-md'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-3'>
						{getIcon()}
						{title}
					</DialogTitle>
					<DialogDescription
						asChild
						className='text-base leading-relaxed'
					>
						<div className='text-muted-foreground'>{description}</div>
					</DialogDescription>
				</DialogHeader>

				<DialogFooter className='gap-2'>
					<Button
						variant='outline'
						onClick={onClose}
						disabled={isConfirming || loading}
					>
						{cancelText}
					</Button>
					<Button
						variant={
							variant === "destructive"
								? "destructive"
								: "default"
						}
						onClick={handleConfirm}
						disabled={isConfirming || loading}
						className='min-w-[80px]'
					>
						{isConfirming || loading ? (
							<div className='flex items-center gap-2'>
								<div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
								{variant === "destructive"
									? "Deleting..."
									: "Please wait..."}
							</div>
						) : (
							confirmText
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

// Specialized delete story dialog
interface DeleteStoryDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void | Promise<void>;
	storyTitle: string;
	hasImages?: boolean;
	loading?: boolean;
}

export function DeleteStoryDialog({
	isOpen,
	onClose,
	onConfirm,
	storyTitle,
	hasImages = false,
	loading = false,
}: DeleteStoryDialogProps) {
	return (
		<ConfirmDialog
			isOpen={isOpen}
			onClose={onClose}
			onConfirm={onConfirm}
			title='Delete Story'
			description={
				<>
					Are you sure you want to delete{" "}
					<strong>&quot;{storyTitle}&quot;</strong>?
					<br />
					<br />
					This will permanently delete:
					<ul className='mt-2 ml-4 list-disc space-y-1'>
						<li>The story content and all segments</li>
						<li>All comprehension questions</li>
						{hasImages && <li>All generated images</li>}
					</ul>
					<br />
					<span className='text-destructive font-medium'>
						This action cannot be undone.
					</span>
				</>
			}
			confirmText='Delete Story'
			cancelText='Keep Story'
			variant='destructive'
			loading={loading}
		/>
	);
}
