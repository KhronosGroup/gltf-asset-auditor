export interface ReportItemInterface {
  componentMessage: string;
  guidelinesUrl: string;
  message: string;
  name: string;
  pass: boolean;
  tested: boolean;
  test: (passCondition: boolean) => void;
}

// Each item in the report which provides the test status as well as messages and a reference link
export class ReportItem implements ReportItemInterface {
  componentMessage = '';
  guidelinesUrl = '';
  message = '';
  name = '';
  pass = false;
  tested = false;

  constructor(name: string, guidelinesUrl?: string) {
    this.guidelinesUrl =
      guidelinesUrl ??
      'https://github.com/KhronosGroup/3DC-Asset-Creation/blob/main/asset-creation-guidelines/RealtimeAssetCreationGuidelines.md';
    this.name = name;
  }

  // Set the test results to PASS or FAIL with messages
  public test(passCondition: boolean, message?: string, componentMessage?: string) {
    this.componentMessage = componentMessage ?? '';
    this.message = message ?? '';
    this.pass = passCondition;
    this.tested = true;
  }

  // Do not run the test and leave the output as NOT TESTED
  public skipTestWithMessage(message: string) {
    this.message = message;
    this.tested = false;
  }
}
