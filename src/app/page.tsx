"use client"
import { useEffect, useState } from "react";

export default function Home() {
	const [apiData, setApiData] = useState<Record<string, string> | null>(null);
       const [loading, setLoading] = useState(true);

	       useEffect(() => {
		       fetch("/api/dummy")
			       .then((res) => res.json())
			       .then((data) => {
				       setApiData(data as Record<string, string>);
				       setLoading(false);
			       })
			       .catch(() => setLoading(false));
	       }, []);

       return (
		<div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
			<main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

					       <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-900">
						       <h2 className="font-bold mb-2">Dummy API Data:</h2>
						       {loading ? (
							       <span>Loading...</span>
						       ) : apiData ? (
							       <>
								       <div>ID: {apiData.id}</div>
								       <div>Title: {apiData.title}</div>
								       <div>Completed: {apiData.completed ? 'Yes' : 'No'}</div>
							       </>
						       ) : (
							       <span>Failed to load data.</span>
						       )}
					       </div>

			</main>
		</div>
	);
}
