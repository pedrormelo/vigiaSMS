"use client"

import { FileItem, type FileType } from "../contextosCard/contextoCard"
import { AddContextButton } from "./adicionarContexto"
import ScrollArea from "@/components/ui/scroll-area"

interface FileData {
    id: string
    title: string
    type: FileType
    insertedDate: string
}

interface FileGridProps {
    files: FileData[]
    onFileClick?: (file: FileData) => void
    onAddContextClick?: () => void
    className?: string
}

// export function FileGrid({ files, onFileClick, onAddContextClick, className }: FileGridProps) {
//     return (
//         <div className="flex justify-center items-center w-full h-full">
//             {/* <div className="bg-white border border-[#f0f0f0] rounded-[50px] shadow-lg backdrop-blur-sm flex flex-col items-center justify-center p-6"> */}
//             <div className="rounded-[50px]  flex flex-col items-center justify-center p-6">
//                 <ScrollArea height="100vh" className="flex-1 w-full" showScrollbar="always">
//                     <div
//                         className={`grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-x-6 mx-auto  p-6 max-h-192 `}
//                     // style={{ maxHeight: '520px', overflowY: 'auto' /  custom-scroll  //  overflow-y-scroll }}
//                     >
//                         <AddContextButton onClick={() => onAddContextClick?.()} />
//                         {files.map((file) => (
//                             <FileItem
//                                 key={file.id}
//                                 title={file.title}
//                                 type={file.type}
//                                 insertedDate={file.insertedDate}
//                                 onClick={() => onFileClick?.(file)}
//                                 className="w-full"
//                             />
//                         ))}
//                     </div>
//                 </ScrollArea>
//             </div>
//         </div>

//     )
// }


export function FileGrid({ files, onFileClick, onAddContextClick, className }: FileGridProps) {
    // Prepare grid items: AddContextButton first, then all files
    const gridItems = [
        <AddContextButton key="add-context" onClick={() => onAddContextClick?.()} />,
        ...files.map((file) => (
            <FileItem
                key={file.id}
                title={file.title}
                type={file.type}
                insertedDate={file.insertedDate}
                onClick={() => onFileClick?.(file)}
                className="w-full"
            />
        ))
    ];

    // Break gridItems into rows of 4
    const rows = [];
    for (let i = 0; i < gridItems.length; i += 4) {
        rows.push(gridItems.slice(i, i + 4));
    }

    return (
        <div className="flex justify-center items-center w-full h-full">
            <div className="rounded-[50px] flex flex-col items-center justify-center">
                <ScrollArea height="880px" snap>
                    {/* <div className="flex-1 p-6 w-full overflow-x-hidden> */}
                    <div className="flex flex-col w-full p-6 gap-4 snap-y snap-mandatory overflow-y-auto max-h-[880px] overflow-x-hidden scroll-smooth">
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="grid pt-2 grid-cols-1 md:grid-cols-4 gap-6 snap-start">
                                {row.map((item, colIndex) => item)}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
