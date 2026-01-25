export const createInput = (
  inputId: string = "file-input",
  appId: string = "app"
): HTMLInputElement => {
  const input = document.createElement("input");
  input.type = "file";
  input.id = inputId;
  input.accept = ".csv";
  const app = document.getElementById(appId) as HTMLElement;
  app.appendChild(input);

  return input;
};
