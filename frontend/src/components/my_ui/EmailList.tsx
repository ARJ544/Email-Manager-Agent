interface Snippet_Subject_Date {
    id: string;
    subject: string;
    date: string;
    snippet: string;
    onSave?: (id: string) => void; // NEW
}

export default function DisplayEmail({ id, subject, date, snippet, onSave }: Snippet_Subject_Date) {

    const parsedDate = new Date(date);

    const notificationDate = parsedDate.toLocaleDateString([], {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const notificationTime = parsedDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="
            w-full bg-white dark:bg-gray-900 shadow-md rounded-2xl p-4 mt-2
            border border-gray-200 dark:border-gray-700 flex flex-col space-y-1
        ">

            <div className="flex justify-between">
                <div className="text-[10px] text-gray-500 dark:text-gray-400 break-all">
                    ID: {id}
                </div>

                {/* Save Button */}
                <button
                    onClick={() => onSave?.(id)}
                    className="cursor-pointer text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                >
                    Save me
                </button>
            </div>

            {/* Date + Time */}
            <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
                    {notificationDate}
                </span>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                    {notificationTime}
                </span>
            </div>

            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {subject}
            </p>

            <p
                className="text-gray-600 dark:text-gray-400 text-sm leading-snug"
                dangerouslySetInnerHTML={{ __html: snippet }}
            />
        </div>
    );
}
