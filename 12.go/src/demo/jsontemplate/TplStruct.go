package jsontemplate

//
type TplStruct struct {
	/**
	 * 分隔符
	 */
	Split string `json:"split,omitempty"`
	/**
	 * 是否array
	 */
	IsArray bool `json:"isArray,omitempty"`
	/**
	 * array field number
	 */
	FieldNum int `json:"fieldNum,omitempty"`
	/**
	 * 下级field StructDefinition
	 */
	Definitions []TplStructDefinition `json:"definitions,omitempty"`
}
