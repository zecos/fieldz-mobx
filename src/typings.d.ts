declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module "mobx";
declare module "mobx-react-lite"