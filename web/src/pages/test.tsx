import { createSignal } from 'solid-js'
import { Button } from '../base-ui/button'
import { DropDown, DropDownOption } from '../base-ui/dropdown'
import { Input } from '../base-ui/input'
import { CreateConnection } from '../components/create-connection'
import { Chat } from './chat'

export const Test = () => {
  const workspaces: DropDownOption[] = [
    { name: 'test1', value: 'test1' },
    { name: 'test2', value: 'test2' },
    { name: 'test3', value: 'test3' }
  ]
  const [value, setValue] = createSignal('')
  const onDropDownChange = (value: DropDownOption) => console.log(value)
  return (<><DropDown
    onChange={onDropDownChange}
    options={workspaces}/>
    <hr/>

    <CreateConnection/>
    <hr/>
    <Button intent='primary' disabled={true}>Primary</Button>
    <Button intent='secondary' disabled={true}>Secondary</Button>
    <Button intent='ghost' disabled={true}>Ghost</Button>
    <hr/>
    <Input signal={[value, setValue]} label='test' type="email" />
    <Chat />
  </>)
}
