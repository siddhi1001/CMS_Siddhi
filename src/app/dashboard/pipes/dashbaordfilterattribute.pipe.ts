import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "attrfilter"
})
export class Dashboardfilterattribute implements PipeTransform {
    transform(TranslationLists: any, AttrName: string, value: any = ""): any {
        let filterValue;
        if (TranslationLists != undefined) {


            if (value == undefined || value == '' || value.ID == "") {
                value = "";
            }
            
            if (typeof value === 'string') {
                filterValue = value.toLowerCase();
            } else {
                filterValue = value.EN.toLowerCase();
            }
            var TranslationRows = TranslationLists.filter(function (obj) {
                return obj.AttrName == AttrName;
            });
            TranslationRows = TranslationRows.filter(
                option => option.Name_EN.toLowerCase().indexOf(filterValue) === 0
            );
            TranslationRows = TranslationRows.map(function (obj) {
                return {
                    "ID": obj.ID,
                    "EN": obj.Name_EN,
                    "AR": obj.Name_AR
                }
            });
            var TranslationList = {
                "actualRows": TranslationRows.length,
                "filteredRows": TranslationRows.length,
                "myRows": TranslationRows,
                "totalRows": TranslationRows.length,
                "totalSourceRows": TranslationRows.length
            };
            return TranslationList.myRows;
        }
    }
}
