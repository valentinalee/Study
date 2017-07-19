package jsontemplate

//
type TplStructDefinition struct {
	Key  string `json:"key,omitempty"`
	Name string `json:"name,omitempty"`
	/**
	 * 是否多个重复
	 */
	IsMulti bool `json:"isMulti,omitempty"`
	/**
	 * array field number
	 */
	Length int `json:"length,omitempty"`
	/**
	 * 属性类型: value-值,struct-结构(见structType)
	 */
	Type string `json:"type,omitempty"`

	ValType string `json:"valType,omitempty"`
	/**
	 * if type=struct,定义结构模版(见Struct)
	 */
	StructType TplStruct `json:"structType,omitempty"`
	/**
	 * 数据值
	 */
	Value      interface{} `json:"value,omitempty"`
	Resolution interface{} `json:"resolution,omitempty"`
	Offset     int         `json:"offset,omitempty"`
}
