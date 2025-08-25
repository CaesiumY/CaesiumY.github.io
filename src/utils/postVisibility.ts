import type { CollectionEntry } from "astro:content";
import { SITE } from "@/config";

/**
 * 포스트가 사용자에게 보여질 수 있는지 결정하는 함수
 * 예약 발행 시간과 draft 상태를 체크
 */
export const isPostVisible = ({ data }: CollectionEntry<"blog">) => {
  // 예약 발행 시간 체크
  const isPublishTimePassed =
    Date.now() >
    new Date(data.pubDatetime).getTime() - SITE.scheduledPostMargin;
  
  // 개발 환경에서는 draft 포스트도 표시 (예약 발행 시간만 체크)
  if (import.meta.env.DEV) {
    return isPublishTimePassed;
  }
  
  // 프로덕션 환경에서는 draft 제외 + 예약 발행 시간 체크
  return !data.draft && isPublishTimePassed;
};

/**
 * 포스트가 draft 상태인지 확인
 */
export const isDraftPost = ({ data }: CollectionEntry<"blog">) => {
  return data.draft === true;
};

/**
 * 전체 포스트에서 draft 포스트만 필터링
 */
export const getDraftPosts = (posts: CollectionEntry<"blog">[]) => {
  return posts.filter(isDraftPost);
};

/**
 * draft 포스트들을 날짜순으로 정렬 (최신순)
 */
export const getSortedDraftPosts = (posts: CollectionEntry<"blog">[]) => {
  return getDraftPosts(posts).sort(
    (a, b) =>
      Math.floor(new Date(b.data.pubDatetime).getTime() / 1000) -
      Math.floor(new Date(a.data.pubDatetime).getTime() / 1000)
  );
};

