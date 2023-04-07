<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Folder;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ItemController extends Controller
{
    private $status_code = 200;

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */

	public function index($id) {
        $items = array();
        $folders = array();
        if($id != "") {
            $items = Item::all()->where("user_id", $id);
			$itemList = [];
			foreach ($items as $key=>$item) {
				$itemList[]       = [
					'key' => $key,
					'name' => $item->name,
					'no' => $key,
					'id' => $item->id
				];
			}

            $folders = Folder::all()->where("user_id", $id);
			$folderList = [];
			foreach ($folders as $key=>$folder) {
				$folderList[]       = [
					'value' => $folder->id,
					'label' => $folder->name
				];
			}

            $categories = Category::all()->where("status", 1);
			$categoryList = [];
			foreach ($categories as $key=>$category) {
				$categoryList[]       = [
					'value' => $category->id,
					'label' => $category->name
				];
			}

            return response()->json(["items" => $itemList, "folders" => $folderList, "categories" => $categoryList ]);
        }
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
        $rules = [
			'name' => 'required|string|min:1|max:255'
		];
		$validator = Validator::make($request->all(),$rules);
		if ($validator->fails()) {
			return response()->json(["status" => 422, "success" => false, "message" => $validator->errors(), "errors" => $validator->errors()]);
		}
		else{
            $data = $request->input();
			try{
				$item = new Item;
                $item->name = $data['name'];
				$item->category_id = !empty($data['category_id']) ? $data['category_id'] : null ;
                $item->folder_id = !empty($data['folder_id']) ? $data['folder_id'] : null ;
				$item->username = !empty($data['username']) ? $data['username'] : null ;
                $item->password = !empty($data['password']) ? $data['password'] : null ;
				$item->url = !empty($data['url']) ? $data['url'] : null ;
                $item->notes = !empty($data['notes']) ? $data['notes'] : null ;
				$item->user_id = $data['user_id'];
                $item->status = 1;
				$item->save();
				return response()->json(["status" => $this->status_code, "success" => true, "message" => "Item added successfully", "data" => $item]);
			}
			catch(Exception $e){
				return response()->json(["status" => 400, "success" => false, "message" => "Failed! Please try again"]);
			}
		}
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function show($id, $userId)
    {
        if($id != "") {
            $item = Item::where("id", $id)->first();
            if($item->folder_id !== null) {
                $folder = Folder::where("id", $item->folder_id)->first();
                $item->folder_name = $folder->name;
            }
            $category = Category::where("id", $item->category_id)->first();
            $item->category_name = $category->name;

            $folders = Folder::all()->where("user_id", $userId);
			$folderList = [];
			foreach ($folders as $key=>$folder) {
				$folderList[]       = [
					'value' => $folder->id,
					'label' => $folder->name
				];
			}

            $categories = Category::all()->where("status", 1);
			$categoryList = [];
			foreach ($categories as $key=>$category) {
				$categoryList[]       = [
					'value' => $category->id,
					'label' => $category->name
				];
			}

            return response()->json(["items" => $item, "folders" => $folderList, "categories" => $categoryList ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function edit(Request $request)
    {
        $rules = [
			'name' => 'required|string|min:1|max:255',
            'id' => 'required',
		];
		$validator = Validator::make($request->all(),$rules);
		if ($validator->fails()) {
			return response()->json(["status" => 422, "success" => false, "message" => $validator->errors(), "errors" => $validator->errors()]);
		}
		else{
            $data = $request->input();
			try{
				$item = Item::where('id', $data['id'])->first();
                $item->name = $data['name'];
				$item->category_id = !empty($data['category_id']) ? $data['category_id'] : null ;
                $item->folder_id = !empty($data['folder_id']) ? $data['folder_id'] : null ;
				$item->username = !empty($data['username']) ? $data['username'] : null ;
                $item->password = !empty($data['password']) ? $data['password'] : null ;
				$item->url = !empty($data['url']) ? $data['url'] : null ;
                $item->notes = !empty($data['notes']) ? $data['notes'] : null ;
				$item->update();

                //$result = Item::where('id', $data['id'])->update(['name' => $data['name']]);
				return response()->json(["status" => $this->status_code, "success" => true, "message" => "Item updated successfully", "data" => $item]);
			}
			catch(Exception $e){
				return response()->json(["status" => 400, "success" => false, "message" => "Failed! Please try again"]);
			}
		}
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\Item  $item
     * @return \Illuminate\Http\Response
     */
    public function delete($id)
    {
        $result = Item::find($id);
		if(!empty($result)) {
			$result->delete();
			return response()->json(["status" => $this->status_code, "success" => true, "message" => "Item deleted successfully"]);
		} else {
			return response()->json(["status" => 400, "success" => false, "message" => "Failed! Please try again"]);
		}
    }

    /**
     * Display a listing of the resource by folder id.
     *
     * @return \Illuminate\Http\Response
     */
    public function itemsByFolderId($id) {
        $items = array();
        if($id != "") {
            $items = Item::all()->where("folder_id", $id);
			$itemList = [];
			foreach ($items as $key=>$item) {
				$itemList[]       = [
					'key' => $key,
					'name' => $item->name,
					'no' => $key,
					'id' => $item->id
				];
			}

            $categories = Category::all()->where("status", 1);
			$categoryList = [];
			foreach ($categories as $key=>$category) {
				$categoryList[]       = [
					'value' => $category->id,
					'label' => $category->name
				];
			}

            return response()->json(["items" => $itemList, "categories" => $categoryList ]);
        }
    }

	/**
     * Export Data
     *
     * @return \Illuminate\Http\Response
     */

	public function export($id) {
        $items = array();
        if($id != "") {
            $items = Item::all()->where("user_id", $id);
			//$itemList = [["id", "name", "category_id", "category_name", "folder_id", "folder_name", "username", "password", "url", "notes"]];
			$itemList = [];
			foreach ($items as $key=>$item) {
				$folderName = null;
				if($item->folder_id !== null) {
					$folderName = Folder::where("id", $item->folder_id)->first();
					$folderName = $folderName->name;
				}
            	$category = Category::where("id", $item->category_id)->first();
				$itemList[] = [
					'id' => $item->id,
					'name' => $item->name,
					'category_id' => $item->category_id,
					'category_name' => $category->name,
					'folder_id' => $item->folder_id,
					'folder_name' => $folderName,
					'username' => $item->username,
					'password' => $item->password,
					'url' => $item->url,
					'notes' => $item->notes
				];
			}
            return response()->json(["items" => $itemList]);
        }
    }

	/**
     * Import Data
     *
     * @return \Illuminate\Http\Response
     */

	public function import(Request $request) {
		$array = $request->data;
		try{
			foreach ($array as $data) {
				$folderId = null;
				if(strlen($data['folder_name']) > 0 ) {
					$folder = new Folder;
					$folder->name = $data['folder_name'];
					$folder->user_id = $request->user_id;
					$folder->status = 1;
					$folder->save();
					$folderId = $folder->id;
				}

				$item = new Item;
				$item->name = $data['name'];
				$item->category_id = !empty($data['type_id']) ? $data['type_id'] : null ;
				$item->folder_id = !empty($folderId) ? $folderId : null ;
				$item->username = !empty($data['username']) ? $data['username'] : null ;
				$item->password = !empty($data['password']) ? $data['password'] : null ;
				$item->url = !empty($data['url']) ? $data['url'] : null ;
				$item->notes = !empty($data['notes']) ? $data['notes'] : null ;
				$item->user_id = $request->user_id;
				$item->status = 1;
				$item->save();
			}
			return response()->json(["status" => $this->status_code, "success" => true, "message" => "Vault data imported successfully"]);
		}
		catch(Exception $e){
			return response()->json(["status" => 400, "success" => false, "message" => "Failed! Please try again"]);
		}
    }
}
