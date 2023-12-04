import { Model } from "../..";
import { IBaseResponse } from "./common";

export namespace PlaylistService {
  export interface GetUserPlaylistRequest {}
  export interface GetUserPlaylistResponse
    extends IBaseResponse<Model.PlaylistInfo[]> {}

  export interface GetPlaylistInfoRequest
    extends Pick<Model.PlaylistInfo, "id"> {}
  export interface GetPlaylistInfoResponse
    extends IBaseResponse<Model.PlaylistInfo> {}

  export interface UpdatePlaylistInfoRequest
    extends Pick<Partial<Model.PlaylistInfo>, "name" | "description"> {
    id: Model.PlaylistInfo["id"];
    thumbnailId: Model.ObjectMetaInfo["id"];
  }
  export interface UpdatePlaylistInfoResponse
    extends IBaseResponse<Model.PlaylistInfo> {}

  export interface CreatePlaylistRequest
    extends Pick<Partial<Model.PlaylistInfo>, "description"> {
    name: Model.PlaylistInfo["name"];
    thumbnailId: Model.ObjectMetaInfo["id"];
  }
  export interface CreatePlaylistResponse
    extends IBaseResponse<Model.PlaylistInfo> {}

  export interface AddMusicToPlaylistRequest {
    playlistId: Model.PlaylistInfo["id"];
    musicId: Model.MusicInfo["id"];
  }
  export interface AddMusicToPlaylistResponse
    extends IBaseResponse<Model.PlaylistInfo> {}
}
