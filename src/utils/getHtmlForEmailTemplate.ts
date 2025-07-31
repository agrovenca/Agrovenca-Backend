import ejs from 'ejs'

export const getHtmlForEmailTemplate = async (templatePath: string, variables: object) => {
  return await ejs.renderFile(templatePath, variables)
}
