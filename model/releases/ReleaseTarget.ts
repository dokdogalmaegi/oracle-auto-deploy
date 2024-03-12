export class ReleaseTarget {
  packageName: string;
  isModifySpec: boolean;
  isModifyBody: boolean;

  constructor(packageName: string, isModifySpec: boolean, isModifyBody: boolean) {
    this.packageName = packageName;
    this.isModifySpec = isModifySpec;
    this.isModifyBody = isModifyBody;
  }
}

export interface ReleaseTargetQuery {
  releaseTarget: ReleaseTarget;
  query: string;
}
