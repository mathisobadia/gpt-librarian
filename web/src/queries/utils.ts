const getAPIUrl = (path: string, workspaceId: string): string => {
  //   const workspaceId = params.workspaceId;
  const urlParams = new URLSearchParams({ workspaceId })
  return `${import.meta.env.VITE_REST_URL}${path}?${urlParams.toString()}`
}

export const makeRequest = async <T>(params: {
  path: string
  workspaceId: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  searchQuery?: string
}): Promise<T> => {
  const { path, workspaceId, method, body, searchQuery } = params
  const token = localStorage.getItem('token')
  if (!token) {
    throw new Error('No token')
  }
  const url = searchQuery ? getAPIUrl(path, workspaceId) + `&searchquery=${searchQuery}` : getAPIUrl(path, workspaceId, token)
  const response = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  })
  if (response.status !== 200) {
    throw new Error('Failed to make request')
  }
  return await response.json()
}
