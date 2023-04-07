<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Folder;
use Illuminate\Support\Facades\Validator;

class FolderController extends Controller
{
    private $status_code = 200;

	public function index($id) {
        $folders = array();
        if($id != "") {
            $folders = Folder::all()->where("user_id", $id);
			$data = [];
			foreach ($folders as $key=>$folder) {
				$data[]       = [
					'key' => $key,
					'name' => $folder->name,
					'no' => $key,
					'id' => $folder->id
				];
			}
            return response()->json($data);
        }
    }

    public function create(Request $request){
        $rules = [
			'name' => 'required|string|min:3|max:255'
		];
		$validator = Validator::make($request->all(),$rules);
		if ($validator->fails()) {
			return response()->json(["status" => 422, "success" => false, "message" => $validator->errors(), "errors" => $validator->errors()]);
		}
		else{
            $data = $request->input();
			try{
				$folder_status   =  Folder::where("name", $request->name)->first();

				if(!is_null($folder_status)) {
					return response()->json(["status" => 400, "success" => false, "message" => "Whoops! This folder name already taken"]);
				}

				$folder = new Folder;
                $folder->name = $data['name'];
				$folder->user_id = $data['user_id'];
                $folder->status = 1;
				$folder->save();
				return response()->json(["status" => $this->status_code, "success" => true, "message" => "Folder added successfully", "data" => $folder]);
			}
			catch(Exception $e){
				return response()->json(["status" => 400, "success" => false, "message" => "Failed! Please try again"]);
			}
		}
    }

	public function edit(Request $request){
        $rules = [
			'name' => 'required|string|min:3|max:255',
			'id' => 'required',
		];
		$validator = Validator::make($request->all(),$rules);
		if ($validator->fails()) {
			return response()->json(["status" => 422, "success" => false, "message" => $validator->errors(), "errors" => $validator->errors()]);
		}
		else{
            $data = $request->input();
			try{
				$folder_status   =  Folder::where("name", $request->name)->first();

				if(!is_null($folder_status)) {
					return response()->json(["status" => 400, "success" => false, "message" => "Whoops! This folder name already taken"]);
				}

				$result = Folder::where('id', $data['id'])->update(['name' => $data['name']]);

				return response()->json(["status" => $this->status_code, "success" => true, "message" => "Folder updated successfully", "data" => $result]);
			}
			catch(Exception $e){
				return response()->json(["status" => 400, "success" => false, "message" => "Failed! Please try again"]);
			}
		}
    }

	public function delete($id)
    {
        $result = Folder::find($id);
		if(!empty($result)) {
			$result->delete();
			return response()->json(["status" => $this->status_code, "success" => true, "message" => "Folder deleted successfully"]);
		} else {
			return response()->json(["status" => 400, "success" => false, "message" => "Failed! Please try again"]);
		}
    }
}
