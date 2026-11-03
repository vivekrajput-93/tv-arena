type LeaderboardSkeletonProps = {
	rows?: number;
};

export default function LeaderboardSkeleton({ rows = 8 }: LeaderboardSkeletonProps) {
	return (
		<div className="w-full rounded-2xl overflow-hidden bg-[#18181B] border border-gray-800 animate-pulse">
			<div className="grid grid-cols-6 gap-4 border-b border-gray-800 px-6 py-4">
				<div className="h-4 w-10 rounded bg-zinc-700" />
				<div className="h-4 w-20 rounded bg-zinc-700" />
				<div className="h-4 w-16 rounded bg-zinc-700" />
				<div className="h-4 w-24 rounded bg-zinc-700" />
				<div className="h-4 w-24 rounded bg-zinc-700" />
				<div className="h-4 w-16 rounded bg-zinc-700" />
			</div>

			{Array.from({ length: rows }).map((_, index) => (
				<div
					key={index}
					className="grid grid-cols-6 gap-4 items-center border-b border-gray-800 px-6 py-5"
				>
					<div className="h-4 w-5 rounded bg-zinc-700" />
					<div className="flex items-center gap-4">
						<div className="h-14 w-10 rounded bg-zinc-700" />
						<div className="h-4 w-44 rounded bg-zinc-700" />
					</div>
					<div className="h-4 w-24 rounded bg-zinc-700" />
					<div className="h-4 w-28 rounded bg-zinc-700" />
					<div className="h-4 w-10 rounded bg-zinc-700" />
					<div className="h-10 w-24 rounded-lg bg-zinc-700" />
				</div>
			))}
		</div>
	);
}
