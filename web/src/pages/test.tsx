import { Button } from '../base-ui/button'
import { DropDown, DropDownOption } from '../base-ui/dropdown'
import { CreateConnection } from '../components/create-connection'

export const Test = () => {
  const workspaces: DropDownOption[] = [
    { name: 'test1', value: 'test1' },
    { name: 'test2', value: 'test2' },
    { name: 'test3', value: 'test3' }

  ]
  const onDropDownChange = (value: DropDownOption) => console.log(value)
  return (<><DropDown
    onChange={onDropDownChange}
    options={workspaces}/>
    <hr/>

    <CreateConnection/>
    <hr/>
    <Button intent='primary'>Primary</Button>
    <Button intent='secondary'>Secondary</Button>
    <Button intent='ghost'>Ghost</Button>

  </>)
}
