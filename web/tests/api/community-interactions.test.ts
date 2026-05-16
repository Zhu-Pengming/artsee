import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as likePost } from "@/app/api/v1/community/posts/[id]/like/route";
import { GET as getComments, POST as createComment } from "@/app/api/v1/community/posts/[id]/comments/route";

type QueryResult = {
  data: unknown;
  error: { code?: string; message: string } | null;
  count?: number | null;
};

class QueryStub {
  public operations: Array<{ method: string; args: unknown[] }> = [];
  public result: QueryResult = { data: [], error: null, count: 0 };
  public singleResult: QueryResult = { data: { id: "comment-1" }, error: null };
  public maybeSingleQueue: QueryResult[] = [];

  select(...args: unknown[]) {
    this.operations.push({ method: "select", args });
    return this;
  }

  eq(...args: unknown[]) {
    this.operations.push({ method: "eq", args });
    return this;
  }

  order(...args: unknown[]) {
    this.operations.push({ method: "order", args });
    return this;
  }

  range(...args: unknown[]) {
    this.operations.push({ method: "range", args });
    return this;
  }

  in(...args: unknown[]) {
    this.operations.push({ method: "in", args });
    return this;
  }

  insert(...args: unknown[]) {
    this.operations.push({ method: "insert", args });
    return this;
  }

  delete(...args: unknown[]) {
    this.operations.push({ method: "delete", args });
    return this;
  }

  single() {
    this.operations.push({ method: "single", args: [] });
    return Promise.resolve(this.singleResult);
  }

  maybeSingle() {
    this.operations.push({ method: "maybeSingle", args: [] });
    return Promise.resolve(
      this.maybeSingleQueue.shift() ?? { data: { id: "post-1", like_count: 1 }, error: null }
    );
  }

  then<TResult1 = QueryResult, TResult2 = never>(
    onfulfilled?: ((value: QueryResult) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return Promise.resolve(this.result).then(onfulfilled, onrejected);
  }
}

const mocked = vi.hoisted(() => ({
  getUserFromBearer: vi.fn(),
  createServiceClient: vi.fn(),
}));

vi.mock("@/lib/api/auth-user", () => ({
  getUserFromBearer: (...args: unknown[]) => mocked.getUserFromBearer(...args),
}));

vi.mock("@/lib/api/supabase-service", () => ({
  createPublicReadClient: () => mocked.createServiceClient(),
  createServiceClient: () => mocked.createServiceClient(),
}));

function buildClient(tableMap: Record<string, QueryStub>, rpc = vi.fn(async () => ({ data: null, error: null }))) {
  return {
    from: (table: string) => {
      const query = tableMap[table];
      if (!query) throw new Error(`Unexpected table: ${table}`);
      return query;
    },
    rpc,
  };
}

const postId = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  mocked.getUserFromBearer.mockReset();
  mocked.createServiceClient.mockReset();
});

describe("community like route", () => {
  it("requires login", async () => {
    mocked.getUserFromBearer.mockResolvedValue(null);
    const req = new NextRequest(`http://localhost/api/v1/community/posts/${postId}/like`, {
      method: "POST",
    });

    const res = await likePost(req, { params: Promise.resolve({ id: postId }) });
    expect(res.status).toBe(401);
  });

  it("increments count only after a new like row is inserted", async () => {
    mocked.getUserFromBearer.mockResolvedValue({ id: "user-1" });
    const posts = new QueryStub();
    posts.maybeSingleQueue = [
      { data: { id: postId }, error: null },
      { data: { like_count: 8 }, error: null },
    ];
    const likes = new QueryStub();
    likes.result = { data: { id: "like-1" }, error: null };
    const rpc = vi.fn(async () => ({ data: null, error: null }));
    mocked.createServiceClient.mockReturnValue(
      buildClient({ community_posts: posts, community_post_likes: likes }, rpc)
    );

    const req = new NextRequest(`http://localhost/api/v1/community/posts/${postId}/like`, {
      method: "POST",
      headers: { authorization: "Bearer token" },
    });
    const res = await likePost(req, { params: Promise.resolve({ id: postId }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toEqual({ liked: true, like_count: 8 });
    expect(likes.operations).toEqual(
      expect.arrayContaining([
        { method: "insert", args: [{ post_id: postId, user_id: "user-1" }] },
      ])
    );
    expect(rpc).toHaveBeenCalledWith("increment_community_post_like", { p_post_id: postId });
  });
});

describe("community comments route", () => {
  it("rejects empty comment text", async () => {
    mocked.getUserFromBearer.mockResolvedValue({ id: "user-1" });
    const req = new NextRequest(`http://localhost/api/v1/community/posts/${postId}/comments`, {
      method: "POST",
      headers: { authorization: "Bearer token" },
      body: JSON.stringify({ body: "   " }),
    });

    const res = await createComment(req, { params: Promise.resolve({ id: postId }) });
    expect(res.status).toBe(400);
  });

  it("lists published comments with pagination", async () => {
    const comments = new QueryStub();
    comments.result = {
      data: [{ id: "c1", post_id: postId, author_id: "user-1", body: "好看", status: "published" }],
      error: null,
      count: 1,
    };
    const profiles = new QueryStub();
    profiles.result = {
      data: [{ id: "user-1", nickname: "小明", avatar_url: null }],
      error: null,
    };
    mocked.createServiceClient.mockReturnValue(
      buildClient({ community_post_comments: comments, user_profiles: profiles })
    );

    const req = new NextRequest(
      `http://localhost/api/v1/community/posts/${postId}/comments?limit=10&offset=20`
    );
    const res = await getComments(req, { params: Promise.resolve({ id: postId }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.count).toBe(1);
    expect(body.data[0].user_profiles.nickname).toBe("小明");
    expect(comments.operations).toEqual(
      expect.arrayContaining([
        { method: "eq", args: ["post_id", postId] },
        { method: "eq", args: ["status", "published"] },
        { method: "range", args: [20, 29] },
      ])
    );
  });
});
