export type CreateOrEditRecordParams = {
  recordType: string
  initialRecord?: unknown
  selectedFolder?: string
  isFavorite?: boolean
  setValue?: (value: string) => void
}

export function useCreateOrEditRecord(): {
  handleCreateOrEditRecord: (params: CreateOrEditRecordParams) => void
}
