type SeeTag = {
  kind: 'see',
  doc: string, // TODO regex
};

type ExampleTag = {
  kind: 'example',
  doc: string,
};

type ParamTag = {
  kind: 'param',
  name: string,
  type?: string,
  doc: string,
};

type ReturnTag = {
  kind: 'return',
  type: string,
};

type UnsupportedTag = {
  kind: 'unsupported',
  value: string,
};

type Tag = SeeTag | ReturnTag | ParamTag | ExampleTag | UnsupportedTag;

type JsDoc = {
  doc: string, // TODO optional?
  tags: {
    [key: number]: Tag,
  },
}

type Param = {
  kind: 'identifier',
  name: string,
  optional: boolean,
  tsType: string | null, // TODO verify
};

type Constructor = {
  jsDoc?: JsDoc,
  params: {
    [key: number]: Param,
  },
};

type FunctionDef = {
  params: {
    [key: number]: Param,
  },
  returnType: string | null, // TODO verify
  isAsync: boolean,
};

type MethodDef = {
  jsDoc?: JsDoc,
  name: string,
  kind: 'getter' | 'setter' | 'method', // TODO verify 'setter'
  functionDef: FunctionDef,
  isStatic: boolean,
};


type ClassDef = {
  jsDoc?: JsDoc,
  extends: string,
  implements: {
    [key: number]: string,
  },
  constructors: {
    [key: number]: Constructor,
  },
  methods: {
    [key: number]: MethodDef,
  },

};

type ClassDefinition = {
  kind           : 'class',
  declarationKind: string,
  name           : string,
  classDef       : ClassDef,
};

type Definition = ClassDefinition;

export type {
  JsDoc, Tag, SeeTag, ExampleTag, ReturnTag, ParamTag, UnsupportedTag,
  Param,
  Constructor, FunctionDef, MethodDef,
  ClassDef,
  Definition, ClassDefinition,
};
