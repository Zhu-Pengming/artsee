// Web端 Mock 数据导出
// 从项目根目录的 mock_data/index.ts 同步数据

// 重新导出类型和数据
export type {
  User,
  School,
  Program,
  Alumni,
  Post,
  Portfolio,
  Mentor,
  ApplicationTask,
  ApplicationProgress,
  ArtResource,
  Artwork,
  QAList,
  QAAnswer,
  News,
} from "../../../mock_data";

// 导入并重新导出数据函数
import {
  currentUser,
  schools,
  posts,
  portfolios,
  mentors,
  applicationProgress,
  artResources,
  artworks,
  qaList,
  newsList,
  getSchools as getSchoolsFn,
  getSchoolById as getSchoolByIdFn,
  getPosts as getPostsFn,
  getPortfolios as getPortfoliosFn,
  getMentors as getMentorsFn,
  getApplicationProgress as getApplicationProgressFn,
  getArtResources as getArtResourcesFn,
  getArtworks as getArtworksFn,
  getQAList as getQAListFn,
  getNews as getNewsFn,
  getCurrentUser as getCurrentUserFn,
} from "../../../mock_data";

// 导出数据
export {
  currentUser,
  schools,
  posts,
  portfolios,
  mentors,
  applicationProgress,
  artResources,
  artworks,
  qaList,
  newsList,
};

// 导出函数
export const getSchools = getSchoolsFn;
export const getSchoolById = getSchoolByIdFn;
export const getPosts = getPostsFn;
export const getPortfolios = getPortfoliosFn;
export const getMentors = getMentorsFn;
export const getApplicationProgress = getApplicationProgressFn;
export const getArtResources = getArtResourcesFn;
export const getArtworks = getArtworksFn;
export const getQAList = getQAListFn;
export const getNews = getNewsFn;
export const getCurrentUser = getCurrentUserFn;

// 默认导出
export default {
  currentUser,
  schools,
  posts,
  portfolios,
  mentors,
  applicationProgress,
  artResources,
  artworks,
  qaList,
  newsList,
  getSchools,
  getSchoolById,
  getPosts,
  getPortfolios,
  getMentors,
  getApplicationProgress,
  getArtResources,
  getArtworks,
  getQAList,
  getNews,
  getCurrentUser,
};
