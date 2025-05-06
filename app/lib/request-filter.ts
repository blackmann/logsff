export interface FilterForm {
	query: string;
	timeRange: "45d" | "48h";
	maxDate?: Date;
}
