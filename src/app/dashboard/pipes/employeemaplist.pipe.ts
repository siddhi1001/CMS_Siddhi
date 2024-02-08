import { Pipe, PipeTransform } from "@angular/core";
import { organizationalChartEmployeeModel } from 'src/app/dashboard/models/organizational-Chart.model';

@Pipe({
    name: "employeemaplist"
})
export class EmployeeMapList implements PipeTransform {
    transform(_map: Map<number, organizationalChartEmployeeModel[]>, _OUID: number): any {        
        if (_map.has(_OUID)) {
            return _map.get(_OUID);
        }
        else {
            return undefined;
        }

    }
}
