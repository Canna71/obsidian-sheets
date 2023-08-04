import { Workbook } from "exceljs";

export function toSpreadsheet(wb: Workbook) {
    const out = wb.worksheets.map(ws=>{
        const ows  = {
            name: ws.name,
            rows: {} as any,
            merges: [] as string[],
            styles: [] as any[],
            // freezes: 
        }
        ws.eachRow((row, rowNumber)=>{
            const rowId = String(row.number-1)
            const rowob:any = {
                cells: {}
            };
            ows.rows[rowId] = rowob;
            const cells = row.eachCell((cell,cellNumber)=>{
                const cellOb = {
                    text:  cell.text,
                    merge: [] as number[]
                }
                if(cell.formula) cellOb.text = "=" + cell.formula;
                if(!cell.isMerged || !cell.model.master){
                    rowob.cells[Number(cell.col)-1] = cellOb;
                    if(cell.isMerged){
                        const merge = (ws as any)._merges[cell.address];
                        // console.log(merge);
                        cellOb.merge = [
                            merge.bottom-merge.top as number,
                            merge.right-merge.left as number
                        ]
                    }
                } else {
                    //
                }
            })
            
        })
        // merges 
        const merges = [];
        for(let m in (ws as any)._merges){
            const merge = (ws as any)._merges[m];
            const range = merge.range
            merges.push(range);
        }
        ows.merges = merges;
        return ows;
    });
    
    return out; 
}
