export class ReleaseTarget {
  packageName: string;
  isModifySpec: boolean;
  isModifyBody: boolean;

  constructor(packageName: string, isModifySpec: boolean, isModifyBody: boolean) {
    this.packageName = packageName;
    this.isModifySpec = isModifySpec;
    this.isModifyBody = isModifyBody;
  }

  get json() {
    return {
      packageName: this.packageName,
      isModifySpec: this.isModifySpec,
      isModifyBody: this.isModifyBody,
    };
  }
}
